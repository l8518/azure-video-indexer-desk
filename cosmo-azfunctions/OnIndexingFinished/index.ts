import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    // const name = (req.query.name || (req.body && req.body.name));
    // req.query.name || req.body.name
    context.log(req.query);
    context.log(req.body);
    context.done();
};

export default httpTrigger;
