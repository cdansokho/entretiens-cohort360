package com.cohort360.engine

import com.cohort360.model._
import com.cohort360.utils.{SolrConf, SolrConnector}
import com.typesafe.scalalogging.LazyLogging
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._

class CohortSearchEngine(spark: SparkSession, solrConf: SolrConf) extends LazyLogging {
  private val connector = new SolrConnector(spark, solrConf)

  // ---------------------------------------------------------------
  //  Mapping Resource FHIR → collection Solr
  // ---------------------------------------------------------------
  private val resourceToCollection: Map[String, String] = Map(
    "Patient"           -> "patientAphp",
    "Encounter"         -> "encounterAphp",
    "DocumentReference" -> "documentReferenceAphp",
    "Organization"      -> "organizationAphp"
  )

  // Column that links a resource to a patient
  private val patientRefColumn: Map[String, String] = Map(
    "Patient"           -> "id",              // Patient itself: the id IS the patient id
    "Encounter"         -> "subject.reference",
    "DocumentReference" -> "subject.reference"
  )

  // ---------------------------------------------------------------
  //  FHIR search-param parser  →  Solr filter queries (fq)
  //  Handles: eq (default), ge, gt, le, lt prefixes
  //  Date values are converted to Solr date range syntax
  // ---------------------------------------------------------------
  private def parseFhirSearchParams(searchParams: String): Seq[String] = {
    if (searchParams == null || searchParams.isEmpty) return Seq.empty

    searchParams.split("&").toSeq.map { param =>
      val parts = param.split("=", 2)
      if (parts.length != 2) {
        logger.warn(s"Malformed search param ignored: $param")
        ""
      } else {
        val field = parts(0)
        val rawValue = parts(1)
        toSolrFilter(field, rawValue)
      }
    }.filter(_.nonEmpty)
  }

  /**
   * Translates a single FHIR search parameter into a Solr filter query string.
   *
   * Supported FHIR prefixes: ge (>=), gt (>), le (<=), lt (<), eq (=, default).
   * Date values are automatically suffixed with T00:00:00Z when needed.
   */
  private def toSolrFilter(field: String, rawValue: String): String = {
    // Detect FHIR comparison prefix (ge, gt, le, lt)
    val prefixPattern = "^(ge|gt|le|lt)(.+)".r

    rawValue match {
      case prefixPattern(prefix, value) =>
        val solrValue = normalizeDateIfNeeded(value)
        prefix match {
          case "ge" => s"$field:[$solrValue TO *]"
          case "gt" => s"$field:{$solrValue TO *}"
          case "le" => s"$field:[* TO $solrValue]"
          case "lt" =>
            // For integer fields like "length", lt12 means length <= 11
            // For date fields, use exclusive range
            if (isIntegerValue(value)) {
              val intVal = value.toInt - 1
              s"$field:[* TO $intVal]"
            } else {
              s"$field:{* TO $solrValue}"
            }
          case _ => s"$field:$solrValue"
        }

      case _ =>
        // No prefix → exact match (eq)
        // For text fields (like description), use simple value for full-text search
        val solrValue = normalizeDateIfNeeded(rawValue)
        s"$field:$solrValue"
    }
  }

  private def isIntegerValue(value: String): Boolean = {
    try { value.toInt; true } catch { case _: NumberFormatException => false }
  }

  private def normalizeDateIfNeeded(value: String): String = {
    // If it looks like a date (YYYY-MM-DD) but lacks time, append T00:00:00Z
    val datePattern = "^\\d{4}-\\d{2}-\\d{2}$".r
    value match {
      case datePattern() => s"${value}T00:00:00Z"
      case _ => value
    }
  }

  // ---------------------------------------------------------------
  //  Extract patient ID from a reference column
  //  For Patient resource: id is already the patient id (e.g. "P1")
  //  For other resources: subject.reference = "Patient/P1" → "P1"
  // ---------------------------------------------------------------
  private def extractPatientId(df: DataFrame, resource: String): DataFrame = {
    val refCol = patientRefColumn.getOrElse(resource, "subject.reference")

    if (resource == "Patient") {
      // The "id" column IS the patient id; normalize to "patientId"
      df.withColumn("patientId", col(refCol))
    } else {
      // subject.reference = "Patient/P1" → extract "P1"
      // Also prefix with "Patient/" to keep consistent format: we store raw id
      df.withColumn("patientId",
        regexp_replace(col(refCol), "^Patient/", "")
      )
    }
  }

  // ---------------------------------------------------------------
  //  Main search method
  // ---------------------------------------------------------------
  def runSearch(criteria: SearchCriteria): Long = {
    import spark.implicits._

    logger.info(s"Starting cohort search with ${criteria.Criteria.size} criteria " +
      s"and ${criteria.Perimeters.size} perimeters")

    // ---- STEP 1: Process each criterion to get a set of patient IDs ----
    var cohortDf: DataFrame = null

    for (criterion <- criteria.Criteria) {
      val resource = criterion.Resource
      val include = criterion.Include.toLowerCase == "true"
      val searchParams = criterion.searchParams

      // Map resource to Solr collection
      val collection = resourceToCollection.getOrElse(resource, {
        // Dynamic fallback: lowercase + "Aphp" suffix
        s"${resource.substring(0, 1).toLowerCase}${resource.substring(1)}Aphp"
      })

      logger.info(s"Processing criterion: Resource=$resource, Include=$include, " +
        s"Collection=$collection, Params=$searchParams")

      // Parse FHIR search params into Solr filters
      val solrFilters = parseFhirSearchParams(searchParams)
      logger.info(s"Solr filters: ${solrFilters.mkString(", ")}")

      // Load data from Solr with filters
      val rawDf = connector.loadCollection(collection, solrFilters)

      // Extract patient IDs from this resource
      val patientIdsDf = extractPatientId(rawDf, resource)
        .select("patientId")
        .distinct()

      val matchCount = patientIdsDf.count()
      logger.info(s"Criterion '$resource' matched $matchCount distinct patients")

      // Apply inclusion/exclusion logic
      if (cohortDf == null) {
        // First criterion
        if (include) {
          cohortDf = patientIdsDf
        } else {
          // Exclusion on first criterion: start with ALL patients, then exclude
          val allPatients = connector.loadCollection("patientAphp")
            .select(col("id").alias("patientId"))
            .distinct()
          cohortDf = allPatients.join(patientIdsDf, Seq("patientId"), "left_anti")
        }
      } else {
        if (include) {
          // Intersection: keep only patients that also match this criterion
          cohortDf = cohortDf.join(patientIdsDf, Seq("patientId"), "inner")
        } else {
          // Exclusion: remove patients that match this criterion (anti-join)
          cohortDf = cohortDf.join(patientIdsDf, Seq("patientId"), "left_anti")
        }
      }

      val currentCount = cohortDf.count()
      logger.info(s"Cohort size after criterion '$resource' (include=$include): $currentCount")
    }

    // ---- STEP 2: Apply perimeter filter ----
    if (criteria.Perimeters.nonEmpty && cohortDf != null) {
      logger.info(s"Applying perimeter filter: ${criteria.Perimeters.mkString(", ")}")

      // Load encounters and filter by serviceProvider matching one of the perimeters
      val perimeterFilters = criteria.Perimeters.map { perim =>
        s"serviceProvider.reference:$perim"
      }
      // Build an OR filter if multiple perimeters
      val perimeterFilter = if (perimeterFilters.size == 1) {
        perimeterFilters.head
      } else {
        perimeterFilters.mkString("(", " OR ", ")")
      }

      val encountersDf = connector.loadCollection("encounterAphp", Seq(perimeterFilter))
      val patientsInPerimeter = encountersDf
        .withColumn("patientId",
          regexp_replace(col("subject.reference"), "^Patient/", "")
        )
        .select("patientId")
        .distinct()

      val perimeterCount = patientsInPerimeter.count()
      logger.info(s"Patients within perimeter: $perimeterCount")

      // Intersect cohort with perimeter patients
      cohortDf = cohortDf.join(patientsInPerimeter, Seq("patientId"), "inner")
    }

    // ---- STEP 3: Count distinct patients ----
    val result = if (cohortDf != null) cohortDf.distinct().count() else 0L
    logger.info(s"Final cohort count: $result distinct patients")
    result
  }

  def stop(): Unit = spark.stop()
}
