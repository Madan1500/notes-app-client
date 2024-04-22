const config = {
    MAX_ATTACHMENT_SIZE: 5000000,
    s3: {
        REGION: "us-east-1",
        BUCKET: "aws-new-bucket-us-east-1",
    },
    apiGateway: {
        REGION: "us-east-1",
        URL: "https://0t0lmawfq0.execute-api.us-east-1.amazonaws.com/prod",
    },
    cognito: {
        REGION: "us-east-1",
        USER_POOL_ID: "us-east-1_owsd2wJ8u",
        APP_CLIENT_ID: "5a6r39od0m3kdhmu83dqp8bu9g",
        IDENTITY_POOL_ID: "us-east-1:39c953e6-a797-4146-a293-516792073cc2",
    },
};

export default config;