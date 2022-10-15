import 'source-map-support/register';

import * as dotenv from 'dotenv';
import { App } from 'aws-cdk-lib';

dotenv.config();

import EcsStack from './EcsStack';

const app = new App();
new EcsStack(app, 'EcsEnvVarExamplesStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
