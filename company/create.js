import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async event => {
  const { sub, email } = event.request.userAttributes;

  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Item: {
      companyId: sub,
      userId: sub,
      email: email
    }
  };

  try {
    await dynamoDbLib.call('put', params);
  } catch (e) {
    console.error(e);
  }
  return event;
};
