# build api
FROM node:20-alpine AS build

ARG BUILD_VERSION=0.0.0-development

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm version --no-git-tag-version --allow-same-version ${BUILD_VERSION}
RUN npm ci

COPY . .
RUN npm run build

# deploy
FROM node:20-alpine AS result

ARG BUILD_VERSION
ARG COMMIT_SHA

ENV NODE_ENV=production \
    BUILD_VERSION=${BUILD_VERSION} \
    COMMIT_SHA=${COMMIT_SHA}

LABEL org.opencontainers.image.source="https://github.com/smartive-education/cas-fee-adv-qwacker-api" \
    org.opencontainers.image.authors="education@smartive.ch" \
    org.opencontainers.image.url="https://github.com/smartive-education/cas-fee-adv-qwacker-api" \
    org.opencontainers.image.documentation="https://github.com/smartive-education/cas-fee-adv-qwacker-api/blob/main/README.md" \
    org.opencontainers.image.source="https://github.com/smartive-education/cas-fee-adv-qwacker-api/blob/main/Dockerfile" \
    org.opencontainers.image.version="${BUILD_VERSION}" \
    org.opencontainers.image.revision="${COMMIT_SHA}" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.title="qwacker API" \
    org.opencontainers.image.description="Demo API for qwacker. This is an API that supports REST, GraphQL and gRPC for education purposes in the CAS FEE Advanced."

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci

COPY --from=build /app/dist ./dist
COPY --from=build /app/retry-migrations.sh ./
RUN chmod +x ./retry-migrations.sh

CMD npm run start:prod
