package com.cohort360.utils

case class SolrConf(solrBaseUrl: String, solrZkHost: String, extraOptions: Map[String, String] = Map.empty)
