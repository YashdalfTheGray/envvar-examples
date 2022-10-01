import * as ec2 from 'aws-cdk-lib/aws-ec2';

import getAgentConfigForLogGroup from './cloudwatchAgentConfig';

export type Registries = {
  [key: string]: {
    username: string;
    password: string;
    email: string;
  };
};

export type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

export function standardUserData(
  clusterName: string,
  logGroupName: string
): ec2.UserData {
  const userData = ec2.UserData.forLinux();

  userData.addCommands(
    'sudo yum install amazon-cloudwatch-agent',
    `echo ${JSON.stringify(
      getAgentConfigForLogGroup(logGroupName)
    )} > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`,
    "cat <<'EOF' >> /etc/ecs/ecs.config",
    `ECS_CLUSTER=${clusterName}`,
    'ECS_LOGLEVEL=debug',
    'EOF'
  );

  return userData;
}

export function dockerAuthUserData(
  clusterName: string,
  logGroupName: string,
  registries: Registries
): ec2.UserData {
  const userData = ec2.UserData.forLinux();

  userData.addCommands(
    'sudo yum install amazon-cloudwatch-agent',
    `echo ${JSON.stringify(
      getAgentConfigForLogGroup(logGroupName)
    )} > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`,
    "cat <<'EOF' >> /etc/ecs/ecs.config",
    `ECS_CLUSTER=${clusterName}`,
    'ECS_ENGINE_AUTH_TYPE=docker',
    `ECS_ENGINE_AUTH_DATA=${JSON.stringify(registries)}`,
    'ECS_LOGLEVEL=debug',
    'EOF'
  );

  return userData;
}

export function awsCredsUserData(
  clusterName: string,
  logGroupName: string,
  creds: Credentials
): ec2.UserData {
  const userData = ec2.UserData.forLinux();

  userData.addCommands(
    'sudo yum install amazon-cloudwatch-agent',
    `echo ${JSON.stringify(
      getAgentConfigForLogGroup(logGroupName)
    )} > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`,
    "cat <<'EOF' >> /etc/ecs/ecs.config",
    `ECS_CLUSTER=${clusterName}`,
    `AWS_ACCESS_KEY_ID=${creds.accessKeyId}`,
    `AWS_SECRET_ACCESS_KEY=${creds.secretAccessKey}`,
    `AWS_SESSION_TOKEN=${creds.sessionToken}`,
    'ECS_LOGLEVEL=debug',
    'EOF'
  );

  return userData;
}

export function highDensityEniUserData(
  clusterName: string,
  logGroupName: string
): ec2.UserData {
  const userData = ec2.UserData.forLinux();

  userData.addCommands(
    'sudo yum install amazon-cloudwatch-agent',
    `echo ${JSON.stringify(
      getAgentConfigForLogGroup(logGroupName)
    )} > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`,
    "cat <<'EOF' >> /etc/ecs/ecs.config",
    `ECS_CLUSTER=${clusterName}`,
    'ECS_ENABLE_HIGH_DENSITY_ENI=true',
    'ECS_LOGLEVEL=debug',
    'EOF'
  );

  return userData;
}
