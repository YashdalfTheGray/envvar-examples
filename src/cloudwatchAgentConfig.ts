export default function getAgentConfigForLogGroup(logGroupName: string) {
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
