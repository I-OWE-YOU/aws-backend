import { failure, success } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { getEnvironment } from "../typings/environment";

export const main = async event => {
  /** @type {string} companyId - UUID */
  const companyId = event.pathParameters.id;
  const userId = event.requestContext.authorizer.claims.sub;

  if (companyId !== userId) {
    return failure({ status: false });
  }

  const params = {
    TableName: getEnvironment().COMPANIES_TABLE_NAME,
    Key: {
      companyId
    }
  };

  try {
    await dynamoDbLib.call('delete', params);
    return success({ status: true });
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
