import { Construct } from 'constructs';
import {
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

export default class EcsContainerInstanceWithDefaults extends Instance {
  constructor(
    scope: Construct,
    id: string,
    ecsCluster: Cluster,
    props: Partial<InstanceProps>
  ) {
    super(
      scope,
      id,
      Object.assign(
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
        },
        props
      )
    );
  }
}
