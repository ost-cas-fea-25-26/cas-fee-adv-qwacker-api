resource "google_service_account" "cloud-runner" {
  account_id   = "cloud-runner"
  display_name = "Google Cloud Run"
  description  = "Account to deploy applications to google cloud run and access SQL instance."
}

resource "google_service_account_key" "cloud-runner-key" {
  service_account_id = google_service_account.cloud-runner.id
}

resource "google_storage_bucket_object" "cloud-runner-key-file" {
  name         = "google-cloud-runner.json"
  content_type = "application/json; charset=utf-8"
  bucket       = data.google_storage_bucket.terraform.name
  content      = base64decode(google_service_account_key.cloud-runner-key.private_key)
}

resource "google_project_iam_member" "cloud-runner" {
  for_each = toset([
    "roles/run.serviceAgent",
    "roles/viewer",
    "roles/storage.objectViewer",
    "roles/run.admin",
    "roles/cloudsql.client"
  ])
  role    = each.key
  member  = "serviceAccount:${google_service_account.cloud-runner.email}"
  project = data.google_project.project.id
}

output "cloud-runner-email" {
  value = google_service_account.cloud-runner.email
}
