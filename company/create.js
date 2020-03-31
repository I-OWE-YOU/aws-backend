import { v1 as uuidv1 } from 'uuid';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async event => {
  const { sub, email } = event.request.userAttributes;

  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Item: {
      companyId: uuidv1(),
      userId: sub,
      email: email
    }
  };

  try {
    await dynamoDbLib.call('put', params);
    return event;
  } catch (e) {
    return event;
  }
};
