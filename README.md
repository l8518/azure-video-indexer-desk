# Azure Function Dockerized Development

This repository shows an example how to use Docker and Azure Function for both development and production.

## Development

To start developing you only need to use `docker-compose up` and you're ready to go.

Changes from the host-mapped file system will automatically be watched.

## Production Build

The production image can be build with `docker-compose.yml -f docker-compose.production-build.yml build`.

