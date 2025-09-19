resource "zitadel_machine_user" "api-access" {
  org_id      = local.zitadel_org_id
  user_name   = "qwacker-api-access-${local.env}"
  name        = "qwacker API Access ${local.env}"
  description = "Service Account to access the user list of the org in env ${local.env}"
}

resource "zitadel_org_member" "api-access" {
  org_id  = local.zitadel_org_id
  user_id = zitadel_machine_user.api-access.id
  roles   = ["ORG_OWNER_VIEWER"]
}

resource "zitadel_personal_access_token" "api-access" {
  org_id          = local.zitadel_org_id
  user_id         = zitadel_machine_user.api-access.id
  expiration_date = "2100-01-01T00:00:00Z"
}

resource "zitadel_project" "project" {
  name                     = "CAS FEE ADV qwacker ${local.env}"
  org_id                   = local.zitadel_org_id
  private_labeling_setting = "PRIVATE_LABELING_SETTING_UNSPECIFIED"
}

resource "zitadel_application_api" "api" {
  org_id           = local.zitadel_org_id
  project_id       = zitadel_project.project.id
  name             = "qwacker API"
  auth_method_type = "API_AUTH_METHOD_TYPE_PRIVATE_KEY_JWT"
}

resource "zitadel_application_key" "app-key" {
  org_id     = local.zitadel_org_id
  project_id = zitadel_project.project.id
  app_id     = zitadel_application_api.api.id

  key_type        = "KEY_TYPE_JSON"
  expiration_date = "2100-01-01T00:00:00Z"
}

resource "zitadel_application_oidc" "frontend" {
  org_id     = local.zitadel_org_id
  project_id = zitadel_project.project.id

  name = "Frontend"
  redirect_uris = [
    "http://localhost/signin",
    "http://localhost:3000/signin",
    "http://localhost:3000/oauth2-redirect.html",
    "http://localhost:5000/signin",
    "http://localhost:8080/signin",
    "http://localhost:3000/api/auth/callback/zitadel",
    "https://cas-fee-adv-qwacker-app.vercel.app/api/auth/callback/zitadel",
    "https://qwacker-api-http-prod-4cxdci3drq-oa.a.run.app/rest/oauth2-redirect.html",
    "https://mumble-yeahyeahyeah.ch/api/auth/callback/zitadel",
    "https://www.mumble-yeahyeahyeah.ch/api/auth/callback/zitadel",,
    "http://host.docker.internal:3000/api/auth/callback/zitadel",
  ]
  app_type                    = "OIDC_APP_TYPE_WEB"
  response_types              = ["OIDC_RESPONSE_TYPE_CODE"]
  grant_types                 = ["OIDC_GRANT_TYPE_AUTHORIZATION_CODE"]
  auth_method_type            = "OIDC_AUTH_METHOD_TYPE_NONE"
  clock_skew                  = "0s"
  dev_mode                    = true
  version                     = "OIDC_VERSION_1_0"
  access_token_type           = "OIDC_TOKEN_TYPE_BEARER"
  id_token_userinfo_assertion = true
}
