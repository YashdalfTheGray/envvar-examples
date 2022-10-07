import { Fn } from 'aws-cdk-lib';
import {
  CloudFormationInit,
  InitCommand,
  InitConfig,
  InitFile,
  InitPackage,
} from 'aws-cdk-lib/aws-ec2';

export default function buildCloudWatchCfnInitConfig(
  instanceName: string,
  logGroupName: string
) {
  return CloudFormationInit.fromConfigSets({
    configSets: {
      default: [
        'installCwAgent',
        'putCwConfig',
        'restartCwAgent',
        'signalCreateComplete',
      ],
    },
    configs: {
      installCwAgent: new InitConfig([
        InitPackage.yum('amazon-cloudwatch-agent'),
        InitPackage.yum('aws-cfn-bootstrap'),
      ]),
      putCwConfig: new InitConfig([
        InitFile.fromObject(
          '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
          getCwAgentConfigForLogGroup(logGroupName)
        ),
      ]),
      restartCwAgent: new InitConfig([
        InitCommand.shellCommand(
          'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop'
        ),
        InitCommand.shellCommand(
          'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s'
        ),
      ]),
      signalCreateComplete: new InitConfig([
        InitCommand.shellCommand(
          Fn.sub(
            '/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackId} --resource ${instanceName} --region ${AWS::Region}',
            {
              instanceName,
            }
          )
        ),
      ]),
    },
  });
}

function getCwAgentConfigForLogGroup(logGroupName: string) {
  return {
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
  };
}
