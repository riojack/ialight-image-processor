import {SQSEvent, Context} from 'aws-lambda';

exports.handler = async function(event: SQSEvent, context: Context) {
    for (const record of event.Records) {
        console.log(record.body);
    }
};
