import cdk = require('aws-cdk-lib');
import sqs = require('aws-cdk-lib/aws-sqs');
import iam = require('aws-cdk-lib/aws-iam');
import lambda = require('aws-cdk-lib/aws-lambda');
import nodeJs = require('aws-cdk-lib/aws-lambda-nodejs');
import core = require('aws-cdk-lib/core');
import lambdaEventSources = require('aws-cdk-lib/aws-lambda-event-sources');
import fs = require('fs');

export class IaLightImageProcessorStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const imagePathQueue = new sqs.Queue(this, 'ialight-image-path-queue', {
      queueName: 'ialight-image-path-queue',
      visibilityTimeout: cdk.Duration.seconds(300),
      deliveryDelay: cdk.Duration.seconds(10)
    });
    core.Tags.of(imagePathQueue).add('description', 'Each item in this queue is the S3 path to the image to be processed.');

    const lambdaLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'WithImageMagick', 'arn:aws:lambda:us-east-1:614219950738:layer:WithImageMagick:1');
    lambdaLayer.addPermission('all-use', { accountId: '614219950738' });

    const imageProcLambda = new nodeJs.NodejsFunction(this, 'Proc', {
      entry: './handler.ts',
      handler: 'index.handler',
      layers: [lambdaLayer],
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: { NODE_OPTIONS: "--enable-source-maps" },
      ephemeralStorageSize: cdk.Size.mebibytes(2048),
      bundling: {
        sourceMap: true,
        minify: true
      }
    });
    core.Tags.of(imageProcLambda).add('description', 'Consumes an SQS record with an S3 path to an image to processed.  Applies various image transformations.');

    const evtImagePathQueueToImageProcLambda = new lambdaEventSources.SqsEventSource(imagePathQueue);

    imageProcLambda.addEventSource(evtImagePathQueueToImageProcLambda);
    const s3ReadPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:ListBucket', 's3:PutObject'],
      resources: ['arn:aws:s3:::iowalight.com', 'arn:aws:s3:::iowalight.com/*'],
    });
    imageProcLambda.role?.grantPrincipal.addToPrincipalPolicy(s3ReadPolicy);
  }
}

const app = new cdk.App();
new IaLightImageProcessorStack(app, 'IaLightImageProcessor');
app.synth();
