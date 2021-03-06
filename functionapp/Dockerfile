### STAGE 1: Development ###

# Image defaults:
FROM mcr.microsoft.com/dotnet/core/sdk:2.1 as functionapp-development
ENV AZURE_FUNCTIONS_ENVIRONMENT=Development
ENV AzureWebJobsSecretStorageType=Files
SHELL ["/bin/bash", "-c"]
CMD npm run start

# Install node.JS:
RUN apt-get update && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash && \
    apt-get install nodejs

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

### STAGE 2: functions build image ###
FROM functionapp-development AS functionapp-builder
RUN npm run build:production

### STAGE 3: functions runtime image ###
FROM mcr.microsoft.com/azure-functions/node:2.0 AS functionapp-production

ENV AZURE_FUNCTIONS_ENVIRONMENT=Production
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
COPY --from=functionapp-builder /azfunc /home/site/wwwroot