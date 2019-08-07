FROM mcr.microsoft.com/azure-functions/node:2.0 AS az-function-production
ENV AZURE_FUNCTIONS_ENVIRONMENT=Production
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
COPY --from=az-function-builder /azfunc /home/site/wwwroot