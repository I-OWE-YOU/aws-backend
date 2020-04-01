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

  console.log(`Get the company from the logged in user with ID: ${userId}`);

  let company;
  try {
    const response = await dynamoDbLib.call('scan', params);

    if (response.Count === 0) {
      const error = 'resource_not_found';
      const errorMsg = 'The company does not exist in the DB';
      console.error({ error, errorMsg, userId });
      return resourceNotFound({ status: false });
    }

    company = response.Items[0];
    console.log(`Successfully fetch the company with ID: ${company.companyId}`);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  console.log('Generate a unique ID');
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

  console.log(
    `Update the company with ID: ${company.companyId} with the unique ID: ${uniqueToken}`
  );

  try {
    await dynamoDbLib.call('update', updateParams);
    console.log('Successfully update company');

    const redirectUrl = `${process.env.STRIPE_CONNECT_URL}&client_id=${process.env.STRIPE_API_CLIENT_ID}&state=${uniqueToken}`;
    console.log(`Generate redirect URL: ${redirectUrl}`);

    return success(redirectUrl);
  } catch (e) {
    console.error(e);
  }
};
