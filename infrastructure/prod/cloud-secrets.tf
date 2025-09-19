# Secret for database password
resource "google_secret_manager_secret" "db-pass" {
  secret_id = "${local.name}-${local.env}-db-pass"

  replication {
    automatic = {}
  }
}

resource "google_secret_manager_secret_version" "db-pass" {
  secret      = google_secret_manager_secret.db-pass.name
  secret_data = random_password.database.result
}

resource "google_secret_manager_secret_iam_member" "db-pass" {
  secret_id = google_secret_manager_secret_version.db-pass.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.terraform_remote_state.shared.outputs.cloud-runner-email}"
  depends_on = [
    google_secret_manager_secret.db-pass,
  ]
}

# Secret for the google cloud storage bucket service account
resource "google_secret_manager_secret" "storage-access" {
  secret_id = "${local.name}-${local.env}-storage-access"

  replication {
    automatic = {}
  }
}

resource "google_secret_manager_secret_version" "storage-access" {
  secret      = google_secret_manager_secret.storage-access.name
  secret_data = base64decode(google_service_account_key.gcs-access-key.private_key)
}

resource "google_secret_manager_secret_iam_member" "storage-access" {
  secret_id = google_secret_manager_secret_version.storage-access.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.terraform_remote_state.shared.outputs.cloud-runner-email}"
  depends_on = [
    google_secret_manager_secret.storage-access,
  ]
}

# Secret for the OIDC application key (API auth)
resource "google_secret_manager_secret" "api-auth-jwt" {
  secret_id = "${local.name}-${local.env}-api-auth-jwt"

  replication {
    automatic = {}
  }
}

resource "google_secret_manager_secret_version" "api-auth-jwt" {
  secret      = google_secret_manager_secret.api-auth-jwt.name
  secret_data = zitadel_application_key.app-key.key_details
}

resource "google_secret_manager_secret_iam_member" "api-auth-jwt" {
  secret_id = google_secret_manager_secret_version.api-auth-jwt.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.terraform_remote_state.shared.outputs.cloud-runner-email}"
  depends_on = [
    google_secret_manager_secret.api-auth-jwt,
  ]
}

# Secret API Access PAT
resource "google_secret_manager_secret" "api-access-pat" {
  secret_id = "${local.name}-${local.env}-api-access-pat"

  replication {
    automatic = {}
  }
}

resource "google_secret_manager_secret_version" "api-access-pat" {
  secret      = google_secret_manager_secret.api-access-pat.name
  secret_data = zitadel_personal_access_token.api-access.token
}

resource "google_secret_manager_secret_iam_member" "api-access-pat" {
  secret_id = google_secret_manager_secret_version.api-access-pat.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.terraform_remote_state.shared.outputs.cloud-runner-email}"
  depends_on = [
    google_secret_manager_secret.api-access-pat,
  ]
}
