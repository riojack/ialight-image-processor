import {SQSEvent, Context} from 'aws-lambda';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: '7+' });

const s3 = new S3Client({});

exports.handler = async function(event: SQSEvent, context: Context) {
    for (const record of event.Records) {
        console.log(record.body);
        const cmd = new GetObjectCommand({Bucket:'iowalight.com', Key: record.body});
        const obj = await s3.send(cmd);
        console.log(obj.ContentLength);
        console.log(gm);
    }
};
