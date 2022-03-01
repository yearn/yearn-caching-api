# Yearn API

Small SDK shim + Metadata endpoint for Yearn

This codebase hosts non user specific data provided by the [SDK](https://github.com/yearn/yearn-sdk) to increase the speed of providing this data as well as reducing the number of web3 calls 

## Setting up GitHub Actions

The service can be deployed using GitHub actions. The service is deployed on the infrastructure described [here](https://github.com/numan/yearn-api-infra).

To set up GitHub actions, you will first need to create a AWS User with the proper IAM policy to deploy the service.

Here is the minimal policy you need:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "RegisterTaskDefinition",
            "Effect": "Allow",
            "Action": [
                "ecs:RegisterTaskDefinition",
                "ecs:DescribeTaskDefinition"
            ],
            "Resource": "*"
        },
        {
            "Sid": "PassRolesInTaskDefinition",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "arn:aws:iam::<aws account id>:role/<yearn api task definition execution role>",
                "arn:aws:iam::<aws account id>:role/<yearn api task definition task role>"
            ]
        },
        {
            "Sid": "DeployService",
            "Effect": "Allow",
            "Action": [
                "ecs:UpdateService",
                "ecs:DescribeServices"
            ],
            "Resource": [
                "arn:aws:ecs:*:<aws account id>:service/yearn-api-cluster/YearnAPIService"
            ]
        },
        {
            "Sid": "GetAuthorizationToken",
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowPush",
            "Effect": "Allow",
            "Action": [
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload"
            ],
            "Resource": "arn:aws:ecr:us-east-1:<aws account id>:repository/yearn-api-repo"
        }
    ]
}
```

Replace the following placeholders:

- `<aws account id>` - Your aws account id
- `<yearn api task definition execution role>` - The name of the task definition execution role. This should be automatically created when your create the [infrastructure](https://github.com/numan/yearn-api-infra)
- `<yearn api task definition task role>` - The name of the task definition task role. This should be automatically created when you create the [infrastructure](https://github.com/numan/yearn-api-infra)


Create a new AWS user and attach the newly created policy to that user.

Create a new [GitHub environment](https://github.com/numan/yearn-api/settings/environments/new) in the repo  called `production`. Add the following secrets in the new environment (use the credentials of the new user you just created):

1. AWS_ACCESS_KEY_ID
2. AWS_SECRET_ACCESS_KEY

**IMPORTANT**

Optionally, setup [environment protection rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules) to control who is able to deploy a new version of the app.

## Deploying a new version

To deploy, run the build and deploy workflow from the [actions](https://github.com/numan/yearn-api/actions/workflows/ecs-build-deploy.yaml) page.
## Starting

```
$ make
```

## Stopping

```
$ make down
```

## Production deployment

```
$ PROD=true make
```
