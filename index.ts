import cdk = require('aws-cdk-lib');
import sqs = require('aws-cdk-lib/aws-sqs');
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

    const imageProcLambda = new nodeJs.NodejsFunction(this, 'Proc', {
      entry: './handler.ts',
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {NODE_OPTIONS:"--enable-source-maps"},
      bundling: {
        sourceMap: true,
        minify: true
      }
    });
    core.Tags.of(imageProcLambda).add('description', 'Consumes an SQS record with an S3 path to an image to processed.  Applies various image transformations.');

    const evtImagePathQueueToImageProcLambda = new lambdaEventSources.SqsEventSource(imagePathQueue);

    imageProcLambda.addEventSource(evtImagePathQueueToImageProcLambda);
  }
}

const app = new cdk.App();
new IaLightImageProcessorStack(app, 'IaLightImageProcessor');
app.synth();
