locals {
  name           = "qwacker-api"
  gcp_region     = "europe-west6"
  env            = "prod"
  zitadel_org_id = "338525821050296516"
  zitadel_issuer = "cas-fee-adv-ed1ide.zitadel.cloud"
}

provider "google" {
  project = "cas-fee-adv-2025"
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
      version = "2.2.0"
    }
  }
}
