import Stripe from 'stripe';
import AWS from 'aws-sdk';

import { failure, resourceNotFound, success, badRequest } from '../libs/response-lib';
import * as secretManagerLib from '../libs/secretmanager-lib';
import { getEnvironment } from '../libs/utils-lib';
// eslint-disable-next-line no-unused-vars
import typings from '../typings/stripeSecrets';

const env = getEnvironment();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const main = async event => {

  if (!event.queryStringParameters) {
    console.warn(`Wrong query string parameters`, event.queryStringParameters);
    return badRequest(`Wrong query string parameters`);
  }

  /** @type {string} amount in cents */
  const amount = event.queryStringParameters.amount;
  /** @type {string} companyId - uuid*/
  const companyId = event.queryStringParameters.companyId;
  /** @type {string} customerEmail - email*/
  const customerEmail = event.queryStringParameters.customerEmail;

  if (!amount || !companyId || !customerEmail) {
    console.warn(`Wrong query string parameters`, event.queryStringParameters);
    return badRequest(`Wrong query string parameters`);
  }

  const amountNumber = Number(amount);
  if (isNaN(amountNumber) || amountNumber < 100 || amountNumber > 25000) {
    console.warn(`The amount should be between 1 and 250. Actual value: ` + amountNumber);
    return badRequest(`The amount should be between 1 and 250`);
  }

  /** @type {AWS.DynamoDB.DocumentClient.GetItemInput} */
  const params = {
    TableName: env.COMPANIES_TABLE_NAME,
    Key: {
      companyId
    },
    ProjectionExpression: 'stripeUserId'
  };

  console.log(`Get the company with ID: ${companyId}`);
  let stripeUserId;
  try {
    const result = await dynamoDb.get(params).promise();

    if (result.Item) {
      stripeUserId = result.Item.stripeUserId;
    } else {
      console.warn(`Company with ID "${companyId}" not found`);
      return resourceNotFound({ status: false, error: 'Company not found!' });
    }
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  const secretName = `${env.STAGE}/stripe`;
  /** @type {typings.StripeSecrets} */
  let stripeSecrets;
  try {
    console.log(`Get secret with name ${secretName}`);
    stripeSecrets = await secretManagerLib.getSecrets(secretName);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  console.log('Initialize Stripe');
  /** @type {Stripe} */
  const stripe = Stripe(stripeSecrets.API_SECRET_KEY);

  console.log('Create a payment checkout session with Stripe');
  /** @type {Stripe.Checkout.Session} */
  let session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card', 'ideal'],
        line_items: [
          {
            name: 'Coupon',
            amount,
            currency: 'eur',
            quantity: 1
          }
        ],
        customer_email: customerEmail,
        success_url: `${env.STRIPE_CHECKOUT_REDIRECT_SUCCESS}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: env.STRIPE_CHECKOUT_REDIRECT_CANCEL,
        metadata: {
          companyId
        }
      },
      {
        stripeAccount: stripeUserId
      }
    );

    console.log('Stripe checkout session successfully created');
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  return success(session);
};
