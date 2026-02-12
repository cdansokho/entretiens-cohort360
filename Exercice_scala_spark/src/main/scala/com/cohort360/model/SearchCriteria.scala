package com.cohort360.model

case class Criterion(
    Resource: String,
    Include: String,
    searchParams: String
)

case class SearchCriteria(
    Perimeters: Seq[String],
    Criteria: Seq[Criterion]
)
