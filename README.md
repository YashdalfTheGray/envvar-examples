# envvar-examples

A repo to mostly experiment with environment variables

## Getting started

```
aws configure
npm install
npm run build
npm run cdk boostrap
npm run cdk synth
npm run cdk deploy
```

## Examples

### `ECS_ENGINE_AUTH_TYPE` and `ECS_ENGINE_AUTH_DATA`

These environment variables are used to allow the ECS Agent the ability to authenticate with customer repositories that might not be public.

The `ECS_ENGINE_AUTH_DATA` specifies the authentication credentials in either username/password auth using the following type

```json
{
  "<registry_uri>": {
    "username": "string",
    "password": "string",
    "email": "string"
  }
}
```

or base64 auth using the following type

```json
{
  "<registry_uri>": {
    "auth": "base64_string",
    "email": "string"
  }
}
```

The `ECS_ENGINE_AUTH_TYPE`, when set to `docker` specifies that the above environment variable contains username/password auth JSON. When set to `dockercfg`, it specifies that the above environment variable contains base64 auth JSON.

### `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN`

These environment variables are fairly common in the AWS credentials configuration space. They can be found while providing credentials to the AWS CLI, to the AWS SDK, and also to the ECS Agent.

These give the the ECS Agent identity to be able to call AWS APIs on behalf of the customer. Usually these credentials come from either the EC2 instance profile or the `AWS_CONTAINER_CREDENTIALS_FULL_URI` environment variable.

If `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` are used, the identity specified by these will take priority over the the identity specified in `AWS_CONTAINER_CREDENTIALS_FULL_URI` or the identity specified by the instance profile.

Read more about the [default credentials provider chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default).

### `ECS_ENABLE_HIGH_DENSITY_ENI`

While using the `awsvpc` network mode, a task ENI is created for each task launched on an instance. For most instances, there is a relatively low limit on the number of ENIs that can be attached to that particular instance. To allow more `awsvpc` network mode tasks to be launched on one particular instance, this environment variable can be enabled.

This will prompt ECS to attach a "trunk" ENI to the instance allowing for more task ENIs, thus allowing for more tasks. There is additional setup required to get high density ENIs working which can be seen [here](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/container-instance-eni.html).

Read more about [ECS task networking](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-networking.html).

## Useful commands

- `npm run build` - compile typescript to js
- `npm run watch` - watch for changes and compile
- `npm run test` - perform the jest unit tests
- `cdk deploy` - deploy this stack to your default AWS account/region
- `cdk diff` - compare deployed stack with current state
- `cdk synth` - emits the synthesized CloudFormation template

## References

- https://docs.aws.amazon.com/cdk/api/v1/docs/aws-ecs-readme.html
- https://medium.com/@mpschendel/running-a-windows-ecs-cluster-with-the-aws-cdk-86913de9b2f9
