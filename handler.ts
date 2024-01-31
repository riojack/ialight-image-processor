import { SQSEvent, Context } from 'aws-lambda';
import { NodeJsClient } from "@smithy/types";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: '7+' });

const s3 = new S3Client({}) as NodeJsClient<S3Client>;

exports.handler = async function (event: SQSEvent, context: Context) {
    for (const record of event.Records) {
        console.log(record.body);
        const cmd = new GetObjectCommand({ Bucket: 'iowalight.com', Key: record.body });
        const obj = await s3.send(cmd);
        const writeStream = fs.createWriteStream('./image.jpg');
        obj.Body?.pipe(writeStream);
        gm(writeStream)
            .resize(100, 100)
            .toBuffer('JPG', async function (err:Error, buffer:Buffer) {
                if (!err) console.log('done');
                const upload = new Upload({
                    client: s3,
                    params: { Bucket: 'iowalight.com', Key:`100X100_${record.body}`, Body:buffer}
                });
                await upload.done();
              });
    }
};
