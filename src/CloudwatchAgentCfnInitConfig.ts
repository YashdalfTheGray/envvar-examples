import {
  CloudFormationInit,
  InitConfig,
  InitFile,
  InitPackage,
} from 'aws-cdk-lib/aws-ec2';

export default function buildCloudWatchCfnInitConfig(logGroupName: string) {
  return CloudFormationInit.fromConfigSets({
    configSets: {
      default: ['installCwAgent', 'putCwConfig'],
    },
    configs: {
      installCwAgent: new InitConfig([
        InitPackage.yum('amazon-cloudwatch-agent'),
      ]),
      putCwConfig: new InitConfig([
        InitFile.fromString(
          '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
          getCwAgentConfigForLogGroup(logGroupName)
        ),
      ]),
    },
  });
}

function getCwAgentConfigForLogGroup(logGroupName: string) {
  return JSON.stringify(
    {
      agent: {
        debug: true,
      },
      logs: {
        logs_collected: {
          files: {
            collect_list: [
              {
                file_path: '/var/log/ecs/ecs-agent.log',
                log_group_name: logGroupName,
                log_stream_name: '{instance_id}/agent-logs',
              },
              {
                file_path: '/var/log/ecs/ecs-init.log',
                log_group_name: logGroupName,
                log_stream_name: '{instance_id}/init-logs',
              },
            ],
          },
        },
      },
    },
    null,
    2
  );
}
