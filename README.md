# ⚠️ DEPRECATED: This repository is no longer maintained.

Please use the new API repo: [smartive/cas-fee-adv-mumble-api](https://github.com/smartive/cas-fee-adv-mumble-api)

# qwacker API

This is the API for "qwacker". A simple API that supports creating
posts, replies and attaching media to them. Furthermore, the API
supports liking and unliking posts and replies.

This API is a demo API for the Certificate of Advanced Studies (CAS)
in Frontend Engineering Advanced at the University of Applied Sciences
OST in Switzerland (CAS FEE ADV OST ... I know. A lot of abbreviations...).

This API delivers the "big three" possibilities of accessing a web API:
"REST", "graphQL", and "gRPC" (and "gRPC Web").

Most calls to the API are required to be authenticated by
[ZITADEL](https://zitadel.com). Accessing the list of "posts" or
the "search" is possible without authentication. To create, like, unlike,
or delete a post (or a reply), the user must be authenticated. The authentication
is done via OIDC and the API expects a valid JWT token in the
`HTTP Authoriztaion` header.

The following sections describe the access to the API in the specific
format and the authentication in detail.

## Kreya

[Kreya](https://kreya.app) is a tool to run requests against APIs like Postman
or Insomnia. It is a native application for Windows, Mac and Linux. In contrast to
the other mentioned clients, it allows fine-grained control over authentication settings
for requests.

The provided Kreya project in the `kreya` folder contains example requests for REST, gRPC and
gRPC Web. Also, the environments are configured with their respective authentication information.

Be sure to use the `Google Cloud Prod` environment to access the publicly available API.
If `Local Development` is used, Kreya will call localhost. This is used for local API development.

Since Kreya does not support graphQL (yet), two sample queries were constructed by hand.
However, you are advices to use the graphQL playground with a fetched access token to
test the graphQL API.

## Authentication

To authenticate against the API of "qwacker", you'll need a valid
access token from ZITADEL. There is a specifically created ZITADEL
instance for qwacker. A valid account in this instance is required
to get an access token. You can configure your application or
Postman/Insomnia/Kreya client to use this instance.

The following OIDC configuration is required to authenticate against
the ZITADEL instance:

| **Property**        | **Value**                                                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issuer              | `https://cas-fee-adv-ed1ide.zitadel.cloud`                                                                                                                                                                        |
| Discovery Endpoint  | `https://cas-fee-adv-ed1ide.zitadel.cloud/.well-known/openid-configuration`                                                                                                                                       |
| Client ID           | `243151322562550215@mumble_auth_demo`                                                                                                                                                                                    |
| Use PKCE            | `true`                                                                                                                                                                                                            |
| Redirect Return URL | One of the following:<br><br>- http://localhost/signin<br>- http://localhost:3000/signin<br>- http://localhost:5000/signin<br>- http://localhost:8080/signin<br>- http://localhost:3000/api/auth/callback/zitadel |

When first encountering the login screen, if no account exists, you may register a new account.

The authentication settings in [Kreya](https://kreya.app) are predefined. Only the correct environment must be used.

## REST

The endpoint for HTTP requests to the API is:
[`https://qwacker-api-http-prod-927407260649.europe-west6.run.app`](qwacker-api-http-prod-927407260649.europe-west6.run.app).
There is a Swagger UI documentation available at
[`qwacker-api-http-prod-927407260649.europe-west6.run.app/rest/`](qwacker-api-http-prod-927407260649.europe-west6.run.app/rest/).
All endpoints and calls are documented in the Swagger UI.

## graphQL

The endpoint for graphQL queries is
[`qwacker-api-http-prod-927407260649.europe-west6.run.app/graphql`](qwacker-api-http-prod-927407260649.europe-west6.run.app/graphql).
This link also provides a graphQL playground where the schema and documentation can be accessed.

## gRPC / gRPC Web

The gRPC endpoint is
[`https://qwacker-api-grpc-prod-927407260649.europe-west6.run.app`](https://qwacker-api-grpc-prod-927407260649.europe-west6.run.app).
The endpoint can be directly accessed by any native gRPC client (NodeJS, Go, Java, ...).

However, if you use gRPC in the browser, some native gRPC functions are not available.
To use the gRPC API in the browser, you need to use a [gRPC Web](https://github.com/grpc/grpc-web) client.
The endpoint for gRPC Web based clients is
[`https://qwacker-api-grpcwebproxy-prod-927407260649.europe-west6.run.app`](https://qwacker-api-grpcwebproxy-prod-927407260649.europe-west6.run.app).

## Development

If you want to develop on this API, follow the instructions below.

1. Clone the repository
2. Install the dependencies with `npm install`
3. Generate the gRPC files with `npm run grpc:types`
4. Copy environment variables `cp .env.dist .env` (Ask smartive for secrets)
5. Start db `npm run deps`
6. Run db migrations
7. Start the API with `npm run start:dev`
