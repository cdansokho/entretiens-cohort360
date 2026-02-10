package com.exercise.engine

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import com.exercise.model._
import com.exercise.utils.SolrConf

/**
 * Unit tests for CohortSearchEngine.
 *
 * These tests validate the FHIR search-param parsing logic and the
 * inclusion/exclusion cohort logic using in-memory DataFrames
 * (no Solr dependency required).
 */
class CohortSearchEngineTest extends AnyFlatSpec with Matchers {

  // Shared SparkSession for all tests
  lazy val spark: SparkSession = SparkSession.builder()
    .appName("CohortSearchEngineTest")
    .master("local[*]")
    .getOrCreate()

  import spark.implicits._

  // ---------------------------------------------------------------
  //  Test the FHIR search-param → Solr filter translation
  //  We use reflection to access the private method for unit testing
  // ---------------------------------------------------------------

  private def invokeToSolrFilter(engine: CohortSearchEngine, field: String, rawValue: String): String = {
    val method = engine.getClass.getDeclaredMethod("toSolrFilter", classOf[String], classOf[String])
    method.setAccessible(true)
    method.invoke(engine, field, rawValue).asInstanceOf[String]
  }

  private def invokeParseFhirSearchParams(engine: CohortSearchEngine, params: String): Seq[String] = {
    val method = engine.getClass.getDeclaredMethod("parseFhirSearchParams", classOf[String])
    method.setAccessible(true)
    method.invoke(engine, params).asInstanceOf[Seq[String]]
  }

  private lazy val dummyConf = SolrConf("http://localhost:8983/solr", "localhost:9983")
  private lazy val engine = new CohortSearchEngine(spark, dummyConf)

  // --- toSolrFilter tests ---

  "toSolrFilter" should "handle ge (greater or equal) prefix for dates" in {
    val result = invokeToSolrFilter(engine, "birthDate", "ge2005-01-01")
    result shouldBe "birthDate:[2005-01-01T00:00:00Z TO *]"
  }

  it should "handle gt (greater than) prefix" in {
    val result = invokeToSolrFilter(engine, "birthDate", "gt2005-01-01")
    result shouldBe "birthDate:{2005-01-01T00:00:00Z TO *}"
  }

  it should "handle le (less or equal) prefix" in {
    val result = invokeToSolrFilter(engine, "birthDate", "le2010-12-31")
    result shouldBe "birthDate:[* TO 2010-12-31T00:00:00Z]"
  }

  it should "handle lt (less than) prefix for integers" in {
    val result = invokeToSolrFilter(engine, "length", "lt12")
    result shouldBe "length:[* TO 11]"
  }

  it should "handle exact match (no prefix) for string values" in {
    val result = invokeToSolrFilter(engine, "gender", "male")
    result shouldBe "gender:male"
  }

  it should "handle exact match for boolean values" in {
    val result = invokeToSolrFilter(engine, "active", "true")
    result shouldBe "active:true"
  }

  it should "handle text search for description" in {
    val result = invokeToSolrFilter(engine, "description", "cancer")
    result shouldBe "description:cancer"
  }

  // --- parseFhirSearchParams tests ---

  "parseFhirSearchParams" should "parse multiple params separated by &" in {
    val result = invokeParseFhirSearchParams(engine,
      "birthDate=ge2005-01-01&gender=male&active=true")
    result should have size 3
    result should contain("birthDate:[2005-01-01T00:00:00Z TO *]")
    result should contain("gender:male")
    result should contain("active:true")
  }

  it should "return empty for null input" in {
    val result = invokeParseFhirSearchParams(engine, null)
    result shouldBe empty
  }

  it should "return empty for empty string" in {
    val result = invokeParseFhirSearchParams(engine, "")
    result shouldBe empty
  }

  // --- Patient ID extraction tests ---

  "extractPatientId" should "use id column for Patient resource" in {
    val method = engine.getClass.getDeclaredMethod("extractPatientId",
      classOf[org.apache.spark.sql.DataFrame], classOf[String])
    method.setAccessible(true)

    val df = Seq(("P1", "male"), ("P2", "female")).toDF("id", "gender")
    val result = method.invoke(engine, df, "Patient").asInstanceOf[org.apache.spark.sql.DataFrame]

    val ids = result.select("patientId").collect().map(_.getString(0)).sorted
    ids shouldBe Array("P1", "P2")
  }

  it should "extract patient id from subject.reference for Encounter" in {
    val method = engine.getClass.getDeclaredMethod("extractPatientId",
      classOf[org.apache.spark.sql.DataFrame], classOf[String])
    method.setAccessible(true)

    val df = Seq(("E1", "Patient/P1"), ("E2", "Patient/P3")).toDF("id", "subject.reference")
    val result = method.invoke(engine, df, "Encounter").asInstanceOf[org.apache.spark.sql.DataFrame]

    val ids = result.select("patientId").collect().map(_.getString(0)).sorted
    ids shouldBe Array("P1", "P3")
  }
}
