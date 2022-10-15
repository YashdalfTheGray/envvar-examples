import { Construct } from 'constructs';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export default class CloudwatchLogsOnlyRole extends Role {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'cloudwatchLogsOnlyInstanceRole',
    });
  }
}
