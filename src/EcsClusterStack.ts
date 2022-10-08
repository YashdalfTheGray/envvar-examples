import { Stack, App, StackProps } from 'aws-cdk-lib';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
  InstanceType,
  InstanceClass,
  InstanceSize,
  Peer,
  Port,
  SecurityGroup,
} from 'aws-cdk-lib/aws-ec2';

import * as customUserData from './customUserData';
import EcsContainerInstanceWithDefaults from './EcsContainerInstanceWithDefaults';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

const {
  DOCKER_AUTH_REGISTRY_URI,
  DOCKER_AUTH_REGISTRY_USERNAME,
  DOCKER_AUTH_REGISTRY_PASSWORD,
  DOCKER_AUTH_REGISTRY_EMAIL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN,
} = process.env;

export default class EcsClusterStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const testCluster = new Cluster(this, 'EcsCluster', {
      clusterName: 'envvar-example-cluster',
    });

    const securityGroup = new SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: testCluster.vpc,
    });

    securityGroup.addIngressRule(Peer.ipv4('0.0.0.0/0'), Port.tcp(80));
    securityGroup.addIngressRule(Peer.ipv4('0.0.0.0/0'), Port.tcp(22));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const logGroup = new LogGroup(this, 'EnvvarExamplesInstanceLogsGroup', {
      logGroupName: 'envvar-examples-instance-logs',
      retention: RetentionDays.ONE_MONTH,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const standardInstance = new EcsContainerInstanceWithDefaults(
      this,
      'EnvvarExamplesStandardInstance',
      testCluster,
      logGroup.logGroupName,
      {
        securityGroup: securityGroup,
        instanceName: 'EnvvarStandardInstance',
        userData: customUserData.standardUserData(
          testCluster.clusterName,
          'EnvvarExamplesStandardInstance'
        ),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const DockerAuthInstance = new EcsContainerInstanceWithDefaults(
      this,
      'EnvvarExamplesDockerAuthInstance',
      testCluster,
      logGroup.logGroupName,
      {
        securityGroup: securityGroup,
        instanceName: 'EnvvarDockerAuthInstance',
        userData: customUserData.dockerAuthUserData(
          testCluster.clusterName,
          'EnvvarExamplesDockerAuthInstance',
          {
            [DOCKER_AUTH_REGISTRY_URI!]: {
              username: DOCKER_AUTH_REGISTRY_USERNAME!,
              password: DOCKER_AUTH_REGISTRY_PASSWORD!,
              email: DOCKER_AUTH_REGISTRY_EMAIL!,
            },
          }
        ),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const credsInstance = new EcsContainerInstanceWithDefaults(
      this,
      'EnvvarExamplesCredsInstance',
      testCluster,
      logGroup.logGroupName,
      {
        securityGroup: securityGroup,
        instanceName: 'EnvvarCredsInstance',
        role: undefined,
        userData: customUserData.awsCredsUserData(
          testCluster.clusterName,
          'EnvvarExamplesCredsInstance',
          {
            accessKeyId: AWS_ACCESS_KEY_ID!,
            secretAccessKey: AWS_SECRET_ACCESS_KEY!,
            sessionToken: AWS_SESSION_TOKEN!,
          }
        ),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const eniTrunkInstance = new EcsContainerInstanceWithDefaults(
      this,
      'EnvvarExamplesEniTrunkInstance',
      testCluster,
      logGroup.logGroupName,
      {
        securityGroup: securityGroup,
        instanceName: 'EnvvarEniTrunkInstance',
        instanceType: InstanceType.of(InstanceClass.M5, InstanceSize.LARGE),
        userData: customUserData.highDensityEniUserData(
          testCluster.clusterName,
          'EnvvarExamplesEniTrunkInstance'
        ),
      }
    );
  }
}
