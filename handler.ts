import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { NodeJsClient } from "@smithy/types";
import { Context, SQSEvent } from 'aws-lambda';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { modifyImage } from "./helpers/images";

const s3 = new S3Client({}) as NodeJsClient<S3Client>;

const { log } = console;

const readdirAsync = util.promisify(fs.readdir);

exports.handler = async function (event: SQSEvent, context: Context) {
    for (const record of event.Records) {
        const s3filePath = record.body;
        log(s3filePath);

        const cmd = new GetObjectCommand({ Bucket: 'iowalight.com', Key: s3filePath });
        const obj = await s3.send(cmd);
        const extension = path.extname(s3filePath);
        const fileName = path.parse(s3filePath).name;
        const s3filePathnoext = path.basename(s3filePath, extension);
        const news3filePath = `${s3filePathnoext}_100X100${extension}`;
        const writeStream = fs.createWriteStream(`/tmp/image_${fileName}.jpg`);
        obj.Body?.pipe(writeStream);
        writeStream.close();
        const readStream = fs.createReadStream(`/tmp/image_${fileName}.jpg`);
        const bufImage = await modifyImage(readStream);
        readStream.close();
        log(bufImage);
        log('---------------------');
        const tmpFiles = await readdirAsync('/tmp');
        log('Files in /tmp...');
        for (const file of tmpFiles) {
            log(`File: ${file}`);
        }

        const upload = new Upload({
            client: s3,
            params: { Bucket: 'iowalight.com', Key: news3filePath, Body: bufImage }
        });
        await upload.done();
    }
};
