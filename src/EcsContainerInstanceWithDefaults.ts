import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import {
  CfnInstance,
  Instance,
  InstanceClass,
  InstanceProps,
  InstanceSize,
  InstanceType,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import {
  AmiHardwareType,
  Cluster,
  EcsOptimizedImage,
} from 'aws-cdk-lib/aws-ecs';
import { Role } from 'aws-cdk-lib/aws-iam';

import buildCloudWatchCfnInitConfig from './CloudwatchAgentCfnInitConfig';

export default class EcsContainerInstanceWithDefaults extends Instance {
  constructor(
    scope: Construct,
    id: string,
    ecsCluster: Cluster,
    instanceLogGroupName: string,
    props: Partial<InstanceProps>
  ) {
    super(
      scope,
      id,
      Object.assign<
        Record<string, unknown>,
        InstanceProps,
        Partial<InstanceProps>
      >(
        {},
        {
          keyName: 'ssh-access',
          vpc: ecsCluster.vpc,
          vpcSubnets: {
            subnetType: SubnetType.PUBLIC,
          },
          instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
          machineImage: EcsOptimizedImage.amazonLinux2(
            AmiHardwareType.STANDARD
          ),
          role: Role.fromRoleName(
            scope,
            `${props.instanceName || 'EcsContainer'}InstanceRole`,
            'ecsInstanceRole'
          ),
          init: buildCloudWatchCfnInitConfig(id, instanceLogGroupName),
          initOptions: {
            configSets: ['cloudwatchAgentSetup'],
            timeout: Duration.minutes(10),
            ignoreFailures: true,
            includeUrl: true,
            includeRole: true,
            printLog: true,
          },
        },
        props
      )
    );

    // this is the escape hatch syntax to get access to the CFN construct
    // https://docs.aws.amazon.com/cdk/v2/guide/cfn_layer.html
    (this.node.defaultChild as CfnInstance).cfnOptions.creationPolicy = {
      resourceSignal: {
        count: 1,
        timeout: 'PT10M',
      },
    };
  }
}
