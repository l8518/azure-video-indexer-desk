import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    
    // Log Input
    context.log(req.query);
    context.log(req.body);

    // Set HTTP Output
    context.res = {};
    // Output to Cosmos DB
    context.bindings.exampleOutput = JSON.stringify({
        hello: "world"
      });
    context.done();
};

export default httpTrigger;
