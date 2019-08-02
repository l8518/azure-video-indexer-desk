FROM mcr.microsoft.com/azure-functions/node:2.0 AS az-function-development

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

RUN npm i -g azure-functions-core-tools@2.7 --unsafe-perm true

WORKDIR ${AzureWebJobsScriptRoot}

COPY . ${AzureWebJobsScriptRoot} 

RUN cd ${AzureWebJobsScriptRoot} && \
    npm install

RUN cd ${AzureWebJobsScriptRoot} && \
    npm run build

CMD npm install && npm run start

