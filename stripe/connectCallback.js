import Stripe from 'stripe';
import { failure, redirect } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async event => {
  /** @type {string} code - authorization code returned from Stripe */
  const code = event.queryStringParameters.code;
  /** @type {string} companyId - the company id to identify the resource in the db */
  const companyId = event.queryStringParameters.state;
  /** @type {string} error */
  const error = event.queryStringParameters.error;
  const stripe = Stripe(process.env.STRIPE_API_SECRET_KEY);

  if (error) {
    /** @type {string} error_description */
    const errorMsg = event.queryStringParameters.error_description;

    await removeStripeConnectToken(companyId);

    return redirect(
      `${process.env.APPLICATION_URL}?error=${error}&error_description=${errorMsg}`
    );
  }

  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code
  });

  if (response.error) {
    return failure(response.error_description);
  }

  const stripeUserId = response.stripe_user_id;
  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Key: {
      companyId
    },
    UpdateExpression:
      'SET stripeUserId = :stripeUserId, stripeConnectToken = ""',
    ExpressionAttributeValues: {
      ':stripeUserId': stripeUserId
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', params);
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
    UpdateExpression: 'SET stripeConnectToken = ""',
    ReturnValues: 'ALL_NEW'
  };

  try {
    await dynamoDbLib.call('update', params);
  } catch (e) {
    console.error(e);
  }
};
