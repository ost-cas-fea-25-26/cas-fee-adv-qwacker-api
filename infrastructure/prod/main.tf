locals {
  name           = "qwacker-api"
  gcp_region     = "europe-west6"
  env            = "prod"
  zitadel_org_id = "179828644300980481"
  zitadel_issuer = "cas-fee-advanced-ocvdad.zitadel.cloud"
}

provider "google" {
  project = "ost-cas-adv-fee"
  region  = local.gcp_region
}

provider "zitadel" {
  domain = local.zitadel_issuer
  token  = var.zitadel_key_path
}

data "google_project" "project" {
}

data "terraform_remote_state" "shared" {
  backend = "gcs"
  config = {
    bucket = "cas-fee-adv-qwacker-api-terraform"
    prefix = "states/shared"
  }
}

terraform {
  backend "gcs" {
    bucket = "cas-fee-adv-qwacker-api-terraform"
    prefix = "states/prod"
  }

  required_providers {
    zitadel = {
      source  = "zitadel/zitadel"
      version = "1.0.0-alpha.9"
    }
  }
}
