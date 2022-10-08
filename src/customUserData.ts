import { Fn } from 'aws-cdk-lib';
import { UserData } from 'aws-cdk-lib/aws-ec2';

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
  instanceName: string
): UserData {
  const userData = UserData.forLinux();

  userData.addCommands(
    Fn.sub(
      '/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ${instanceName} --configsets cloudwatchAgentSetup --region ${AWS::Region}',
      { instanceName }
    ),
    "cat <<'EOF' >> /etc/ecs/ecs.config",
    `ECS_CLUSTER=${clusterName}`,
    'ECS_LOGLEVEL=debug',
    'EOF'
  );

  return userData;
}

export function dockerAuthUserData(
  clusterName: string,
  instanceName: string,
  registries: Registries
): UserData {
  const userData = UserData.forLinux();

  userData.addCommands(
    Fn.sub(
      '/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ${instanceName} --configsets cloudwatchAgentSetup --region ${AWS::Region}',
      { instanceName }
    ),
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
  instanceName: string,
  creds: Credentials
): UserData {
  const userData = UserData.forLinux();

  userData.addCommands(
    Fn.sub(
      '/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ${instanceName} --configsets cloudwatchAgentSetup --region ${AWS::Region}',
      { instanceName }
    ),
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
  instanceName: string
): UserData {
  const userData = UserData.forLinux();

  userData.addCommands(
    Fn.sub(
      '/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ${instanceName} --configsets cloudwatchAgentSetup --region ${AWS::Region}',
      { instanceName }
    ),
    "cat <<'EOF' >> /etc/ecs/ecs.config",
    `ECS_CLUSTER=${clusterName}`,
    'ECS_ENABLE_HIGH_DENSITY_ENI=true',
    'ECS_LOGLEVEL=debug',
    'EOF'
  );

  return userData;
}
