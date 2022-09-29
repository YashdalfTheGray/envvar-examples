import 'source-map-support/register';
import { App } from 'aws-cdk-lib';

import EcsClusterStack from './EcsClusterStack';

const app = new App();
new EcsClusterStack(app, 'EcsClusterStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
