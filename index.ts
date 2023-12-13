import lambda = require('aws-cdk-lib/aws-lambda');
import cdk = require('aws-cdk-lib');

import fs = require('fs');

export class IaLightImageProcessorStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    new lambda.Function(this, 'Proc', {
      code: new lambda.InlineCode(fs.readFileSync('handler.js', { encoding: 'utf-8' })),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.NODEJS_20_X,
    });
  }
}

const app = new cdk.App();
new IaLightImageProcessorStack(app, 'IaLightImageProcessor');
app.synth();
