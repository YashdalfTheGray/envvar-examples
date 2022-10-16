import { Construct } from 'constructs';
import {
  Compatibility,
  TaskDefinition,
  TaskDefinitionProps,
} from 'aws-cdk-lib/aws-ecs';
import { Role } from 'aws-cdk-lib/aws-iam';

export default class TaskDefinitionWithDefaults extends TaskDefinition {
  constructor(
    scope: Construct,
    id: string,
    logGroupName: string,
    props: Partial<TaskDefinitionProps>
  ) {
    super(
      scope,
      id,
      Object.assign<
        Record<string, unknown>,
        TaskDefinitionProps,
        Partial<TaskDefinitionProps>
      >(
        {},
        {
          compatibility: Compatibility.EC2_AND_FARGATE,
          executionRole: Role.fromRoleName(
            scope,
            `${props.family || id}TaskExecutionRole`,
            'ecsTaskExecutionRole'
          ),
        },
        props
      )
    );
  }
}
