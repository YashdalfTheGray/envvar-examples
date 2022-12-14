import { Stack, App, StackProps } from 'aws-cdk-lib';
import { Cluster, Ec2Service, NetworkMode } from 'aws-cdk-lib/aws-ecs';
import {
  InstanceType,
  InstanceClass,
  InstanceSize,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

import {
  standardUserData,
  dockerAuthUserData,
  awsCredsUserData,
  highDensityEniUserData,
  getNginxContainer,
} from './util';
import EcsContainerInstanceWithDefaults from './EcsContainerInstanceWithDefaults';
import CloudwatchLogsOnlyRole from './CloudwatchLogsOnlyRole';
import TaskDefinitionWithDefaults from './TaskDefinitionWithDefaults';

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
      capacity: {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
        autoScalingGroupName: 'EnvvarAutoScalingGroup',
        associatePublicIpAddress: true,
        keyName: 'ssh-access',
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
      },
    });

    const securityGroup = new SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: testCluster.vpc,
    });

    securityGroup.addIngressRule(Peer.ipv4('0.0.0.0/0'), Port.tcp(80));
    securityGroup.addIngressRule(Peer.ipv4('0.0.0.0/0'), Port.tcp(22));

    const cloudwatchLogsOnlyRole = new CloudwatchLogsOnlyRole(
      this,
      'EnvvarExamplesWriteLogsOnlyRole'
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const logGroup = new LogGroup(this, 'EnvvarExamplesLogsGroup', {
      logGroupName: 'envvar-examples-logs',
      retention: RetentionDays.THREE_DAYS,
    });

    const nginxTaskDef = new TaskDefinitionWithDefaults(
      this,
      'NginxTaskDefWithLogs',
      { family: 'nginx-taskdef-with-logs', networkMode: NetworkMode.AWS_VPC }
    );

    nginxTaskDef.addContainer('NginxWebContainer', getNginxContainer(logGroup));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const standardInstance = new EcsContainerInstanceWithDefaults(
      this,
      'EnvvarExamplesStandardInstance',
      testCluster,
      logGroup.logGroupName,
      {
        securityGroup: securityGroup,
        instanceName: 'EnvvarStandardInstance',
        userData: standardUserData(testCluster.clusterName),
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
        userData: dockerAuthUserData(testCluster.clusterName, {
          [DOCKER_AUTH_REGISTRY_URI!]: {
            username: DOCKER_AUTH_REGISTRY_USERNAME!,
            password: DOCKER_AUTH_REGISTRY_PASSWORD!,
            email: DOCKER_AUTH_REGISTRY_EMAIL!,
          },
        }),
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
        userData: awsCredsUserData(testCluster.clusterName, {
          accessKeyId: AWS_ACCESS_KEY_ID!,
          secretAccessKey: AWS_SECRET_ACCESS_KEY!,
          sessionToken: AWS_SESSION_TOKEN!,
        }),
        cwAgentRole: cloudwatchLogsOnlyRole,
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
        userData: highDensityEniUserData(testCluster.clusterName),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const envvarService = new Ec2Service(this, 'EnvvarExampleService', {
      cluster: testCluster,
      taskDefinition: nginxTaskDef,
      assignPublicIp: true,
      daemon: true,
      securityGroups: [securityGroup],
      vpcSubnets: {
        subnets: testCluster.vpc.publicSubnets,
      },
    });
  }
}
