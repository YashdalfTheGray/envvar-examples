// import { Fn } from 'aws-cdk-lib';
import {
  CloudFormationInit,
  InitCommand,
  InitConfig,
  InitFile,
} from 'aws-cdk-lib/aws-ec2';
import { IRole } from 'aws-cdk-lib/aws-iam';

export function buildCloudWatchCfnInitConfig(
  _instanceName: string,
  logGroupName: string,
  cwAgentRole?: IRole
) {
  return CloudFormationInit.fromConfigSets({
    configSets: {
      cloudwatchAgentSetup: [
        'putCwConfig',
        'stopCwAgent',
        'setDebugLogLevel',
        'restartCwAgent',
      ],
    },
    configs: {
      // amazon-cloudwatch-agent is already installed on ECS optimized AMIs
      // but in the userdata we'll fetch the latest cloudwatch agent
      // version anyway
      // installCwAgent: new InitConfig([
      //   InitPackage.yum('amazon-cloudwatch-agent'),
      // ]),
      putCwConfig: new InitConfig([
        InitFile.fromObject(
          '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
          getCwAgentConfigForLogGroup(logGroupName, cwAgentRole)
        ),
        // put this file somewhere else too because cloudwatch agent just deletes it
        InitFile.fromObject(
          '/tmp/amazon-cloudwatch-agent.json',
          getCwAgentConfigForLogGroup(logGroupName, cwAgentRole)
        ),
      ]),
      stopCwAgent: new InitConfig([
        InitCommand.shellCommand(
          'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop'
        ),
      ]),
      setDebugLogLevel: new InitConfig([
        InitCommand.shellCommand(
          'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a set-log-level -l DEBUG'
        ),
      ]),
      restartCwAgent: new InitConfig([
        InitCommand.shellCommand(
          'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s'
        ),
      ]),
      // we also don't need this because cdk inlines this into the userdata
      // signalCreateComplete: new InitConfig([
      //   InitCommand.shellCommand(
      //     Fn.sub(
      //       '/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackId} --resource ${instanceName} --region ${AWS::Region}',
      //       {
      //         instanceName,
      //       }
      //     )
      //   ),
      // ]),
    },
  });
}

function getCwAgentConfigForLogGroup(
  logGroupName: string,
  cwAgentRole?: IRole
) {
  const base = {
    // you would generally set the log level here but cfn-init turns
    // this boolean into string, for some reason, so we'll set it
    // elsewhere
    // agent: {
    //   debug: true,
    // },
    logs: {
      logs_collected: {
        files: {
          collect_list: [
            {
              file_path: '/var/log/ecs/ecs-agent.log',
              log_group_name: logGroupName,
              log_stream_name: 'instance/{instance_id}/agent-logs',
            },
            {
              file_path: '/var/log/ecs/ecs-init.log',
              log_group_name: logGroupName,
              log_stream_name: 'instance/{instance_id}/init-logs',
            },
          ],
        },
      },
    },
  };

  if (cwAgentRole) {
    type BaseWithAgent = typeof base & {
      agent: { credentials: { role_arn: string } };
    };
    (base as BaseWithAgent).agent = {
      credentials: {
        role_arn: cwAgentRole.roleArn,
      },
    };
  }

  return base;
}
