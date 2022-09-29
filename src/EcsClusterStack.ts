import { Stack, App, StackProps } from 'aws-cdk-lib';
import {
  Cluster,
  EcsOptimizedImage,
  AmiHardwareType,
} from 'aws-cdk-lib/aws-ecs';
import {
  SubnetType,
  InstanceType,
  InstanceClass,
  InstanceSize,
  Instance,
  Peer,
  Port,
  SecurityGroup,
} from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';

import * as customUserData from './customUserData';

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
    const standardInstance = new Instance(
      this,
      'EnvvarExamplesStandardInstance',
      {
        keyName: 'ssh-access',
        vpc: testCluster.vpc,
        securityGroup: securityGroup,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
        machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.STANDARD),
        instanceName: 'EnvvarStandardInstance',
        role: Role.fromRoleName(
          this,
          'StandardInstanceRole',
          'ecsInstanceRole'
        ),
        userData: customUserData.standardUserData(testCluster.clusterName),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dockerAuthInstance = new Instance(
      this,
      'EnvvarExamplesDockerAuthInstance',
      {
        keyName: 'ssh-access',
        vpc: testCluster.vpc,
        securityGroup: securityGroup,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
        machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.STANDARD),
        instanceName: 'EnvvarDockerAuthInstance',
        role: Role.fromRoleName(
          this,
          'DockerAuthInstanceRole',
          'ecsInstanceRole'
        ),
        userData: customUserData.dockerAuthUserData(testCluster.clusterName, {
          [DOCKER_AUTH_REGISTRY_URI!]: {
            username: DOCKER_AUTH_REGISTRY_USERNAME!,
            password: DOCKER_AUTH_REGISTRY_PASSWORD!,
            email: DOCKER_AUTH_REGISTRY_EMAIL!,
          },
        }),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const credsInstance = new Instance(this, 'EnvvarExamplesCredsInstance', {
      keyName: 'ssh-access',
      vpc: testCluster.vpc,
      securityGroup: securityGroup,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.STANDARD),
      instanceName: 'EnvvarCredsInstance',
      userData: customUserData.awsCredsUserData(testCluster.clusterName, {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
        sessionToken: AWS_SESSION_TOKEN!,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const eniTrunkInstance = new Instance(
      this,
      'EnvvarExamplesEniTrunkInstance',
      {
        keyName: 'ssh-access',
        vpc: testCluster.vpc,
        securityGroup: securityGroup,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        instanceType: InstanceType.of(InstanceClass.M5, InstanceSize.LARGE),
        machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.STANDARD),
        instanceName: 'EnvvarEniTrunkInstance',
        userData: customUserData.highDensityEniUserData(
          testCluster.clusterName
        ),
      }
    );
  }
}
