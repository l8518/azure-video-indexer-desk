FROM mcr.microsoft.com/azure-functions/node:2.0 AS az-function-builder
RUN npm i -g azure-functions-core-tools@2.7 --unsafe-perm true
ENV AZURE_FUNCTIONS_ENVIRONMENT=Development

COPY . ${AzureWebJobsScriptRoot} 

RUN cd ${AzureWebJobsScriptRoot} && \
    npm install

RUN cd ${AzureWebJobsScriptRoot} && \
    npm run build:production


FROM mcr.microsoft.com/azure-functions/node:2.0 AS az-function-production

ENV AZURE_FUNCTIONS_ENVIRONMENT=Production
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY --from=az-function-builder ${AzureWebJobsScriptRoot} ${AzureWebJobsScriptRoot}
