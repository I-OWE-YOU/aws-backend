import AWS from 'aws-sdk';

export function call(action, params) {
  AWS.config.update({ region: process.env.AWS_REGION });

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}
