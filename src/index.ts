import 'source-map-support/register';

import * as dotenv from 'dotenv';
import { App } from 'aws-cdk-lib';

dotenv.config();

import EcsClusterStack from './EcsClusterStack';

const app = new App();
new EcsClusterStack(app, 'EcsEnvVarExamplesClusterStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
