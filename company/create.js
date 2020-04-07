import * as dynamoDbLib from '../libs/dynamodb-lib';
import { getEnvironment } from '../libs/utils-lib';

export const main = async event => {
  const { sub, email } = event.request.userAttributes;

  const params = {
    TableName: getEnvironment().COMPANIES_TABLE_NAME,
    Item: {
      companyId: sub,
      userId: sub,
      email: email,
      acceptedTerms: true
    }
  };

  try {
    await dynamoDbLib.call('put', params);
  } catch (e) {
    console.error(e);
  }
  return event;
};
