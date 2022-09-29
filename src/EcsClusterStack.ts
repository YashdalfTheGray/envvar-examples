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
    const standardInstance = new Instance(this, 'DockerAuthInstance', {
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
      userData: customUserData.standardUserData(testCluster.clusterName),
    });
  }
}
