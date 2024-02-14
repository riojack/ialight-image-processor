import { SQSEvent, Context } from 'aws-lambda';
import { NodeJsClient } from "@smithy/types";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { deleteFile, modifyImage } from "./helpers/images";
import fs from 'fs';
import path from 'path';

const s3 = new S3Client({}) as NodeJsClient<S3Client>;

exports.handler = async function (event: SQSEvent, context: Context) {
    fs.readdir("/tmp", (err, files) => {
        files.forEach(file => {
            console.log(file);
        });
    });
    for (const record of event.Records) {
        const s3filePath = record.body;
        console.log(s3filePath);
        // await deleteFile('./image.jpg');
        const cmd = new GetObjectCommand({ Bucket: 'iowalight.com', Key: s3filePath });
        const obj = await s3.send(cmd);
        const extension = path.extname(s3filePath);
        const fileName = path.parse(s3filePath).name;
        const s3filePathnoext = path.basename(s3filePath, extension);
        const news3filePath = `${s3filePathnoext}_100X100${extension}`;
        const writeStream = fs.createWriteStream(`/tmp/image_${fileName}.jpg`);
        obj.Body?.pipe(writeStream);
        console.log(writeStream);
        const BUF = await modifyImage(writeStream);
        console.log(writeStream);
        const upload = new Upload({
            client: s3,
            params: { Bucket: 'iowalight.com', Key: news3filePath, Body: BUF }
        });
        await upload.done();
    }
};
