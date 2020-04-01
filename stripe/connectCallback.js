import Stripe from 'stripe';
import { failure, redirect, redirectWithError } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async event => {
  /** @type {string} code - authorization code returned from Stripe */
  const code = event.queryStringParameters.code;
  const stripeConnectToken = event.queryStringParameters.state;
  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    ExpressionAttributeValues: {
      ':stripeConnectToken': stripeConnectToken
    },
    FilterExpression: 'stripeConnectToken = :stripeConnectToken'
  };

  let company;

  try {
    const response = await dynamoDbLib.call('scan', params);

    if (response.Count === 0) {
      const error = 'resource_not_found';
      const errorMsg = 'The company does not exist in the DB';
      return redirectWithError(process.env.APPLICATION_URL, error, errorMsg);
    }

    company = response.Items[0];
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  /** @type {string} error */
  const error = event.queryStringParameters.error;
  const stripe = Stripe(process.env.STRIPE_API_SECRET_KEY);

  if (error) {
    /** @type {string} error_description */
    const errorMsg = event.queryStringParameters.error_description;

    await removeStripeConnectToken(company.companyId);

    return redirectWithError(process.env.APPLICATION_URL, error, errorMsg);
  }

  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code
  });

  if (response.error) {
    return failure(response.error_description);
  }

  const stripeUserId = response.stripe_user_id;
  const updateParams = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Key: {
      companyId: company.companyId
    },
    AttributeUpdates: {
      stripeUserId: {
        Value: stripeUserId,
        Action: 'PUT'
      },
      stripeConnectToken: {
        Action: 'DELETE'
      }
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', updateParams);
    return redirect(process.env.APPLICATION_URL);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};

const removeStripeConnectToken = async companyId => {
  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Key: {
      companyId
    },
    AttributeUpdates: {
      stripeConnectToken: {
        Action: 'DELETE'
      }
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', params);
  } catch (e) {
    console.error(e);
  }
};
