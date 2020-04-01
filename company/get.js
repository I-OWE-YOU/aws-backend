import { failure, resourceNotFound, success } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async event => {
  /** @type {string} id - UUID */
  const companyId = event.pathParameters.id;
  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Key: {
      companyId
    }
  };

  try {
    const result = await dynamoDbLib.call('get', params);

    if (result.Item) {
      return success(result.Item);
    } else {
      return resourceNotFound({ status: false, error: 'Item not found!' });
    }
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  return success('Get a company');
};
