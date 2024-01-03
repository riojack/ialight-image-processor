import {SQSEvent, Context} from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

exports.handler = async function(event: SQSEvent, context: Context) {
    for (const record of event.Records) {
        console.log(record.body);
        const obj = await s3.getObject({Bucket:'iowalight.com', Key: record.body}).promise();
        console.log(obj.ContentLength);
    }
};
