locals {
  name       = "qwacker-api"
  gcp_region = "europe-west6"
}

provider "google" {
  project = "cas-fee-adv-2025"
  region  = local.gcp_region
}

data "google_project" "project" {
}

terraform {
  backend "gcs" {
    bucket = "cas-fee-adv-qwacker-api-terraform"
    prefix = "states/shared"
  }
}
