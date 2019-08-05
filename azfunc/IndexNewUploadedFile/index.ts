import { AzureFunction, Context } from "@azure/functions"

const eventGridTrigger: AzureFunction = async function (context: Context, eventGridEvent: any): Promise<void> {
    context.log(typeof eventGridEvent);
    context.log(eventGridEvent);
    context.log(context);
    context.res = {
        status: 200,
        body: "Return from IndexNewUploadedFile"
    };
};

export default eventGridTrigger;
