import { v1 as uuidv1 } from 'uuid';

import { failure, resourceNotFound, success } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async event => {
  /** @type {string} userId */
  const userId = event.requestContext.authorizer.claims.sub;
  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    ExpressionAttributeValues: {
      ':userId': userId
    },
    FilterExpression: 'userId = :userId'
  };

  let company;

  try {
    const response = await dynamoDbLib.call('scan', params);

    if (response.Count === 0) {
      return resourceNotFound({ status: false });
    }

    company = response.Items[0];
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  const uniqueToken = uuidv1();

  const updateParams = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Key: {
      companyId: company.companyId
    },
    UpdateExpression: 'SET stripeConnectToken = :stripeConnectToken',
    ExpressionAttributeValues: {
      ':stripeConnectToken': uniqueToken
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', updateParams);
    const redirectUrl = `${process.env.STRIPE_CONNECT_URL}&client_id=${process.env.STRIPE_API_CLIENT_ID}&state=${uniqueToken}`;
    return success(redirectUrl);
  } catch (e) {
    console.error(e);
  }
};
