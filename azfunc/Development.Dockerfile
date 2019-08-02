### STAGE 1: Development ###

# Image defaults:
FROM node:10 as az-function-development
ENV AZURE_FUNCTIONS_ENVIRONMENT=Development
ENV AzureWebJobsSecretStorageType=Files
SHELL ["/bin/bash", "-c"]
CMD func start

WORKDIR /azfunc
# Prepare Az Functions Dev Enviroment
COPY host.json host.json
RUN apt-get update && \
    curl -O https://dot.net/v1/dotnet-install.sh && \
    source dotnet-install.sh --channel Current && \
    rm dotnet-install.sh && \
    npm i -g azure-functions-core-tools@2.7 --unsafe-perm true && \
    func extensions install

# NPM Install Stuff
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install

# Copy the Az Funcs Source
COPY . .