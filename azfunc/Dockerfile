### STAGE 1: Builder ###
FROM azfunc_dev AS az-function-builder

RUN npm run build:production

### STAGE 2: functions runtime image ###
FROM mcr.microsoft.com/azure-functions/node:2.0 AS az-function-production

ENV AZURE_FUNCTIONS_ENVIRONMENT=Production
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
COPY --from=az-function-builder /azfunc /home/site/wwwroot