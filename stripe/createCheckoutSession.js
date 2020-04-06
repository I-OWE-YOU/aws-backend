import Stripe from 'stripe';

import { failure, resourceNotFound, success } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { getEnvironment } from '../libs/utils-lib';

const env = getEnvironment();

export const main = async event => {
  /**
   * @type {number} amount
   * @type {string} companyId - uuid
   * @type {string} customerEmail
   */
  const { amount, companyId, customerEmail } = event.queryStringParameters;

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
    const result = await dynamoDbLib.call('get', params);

    if (result.Item) {
      stripeUserId = result.Item.stripeUserId;
    } else {
      return resourceNotFound({ status: false, error: 'Item not found!' });
    }
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }

  console.log('Initialize Stripe');
  const stripe = Stripe(env.STRIPE_API_SECRET_KEY);

  console.log('Create a payment checkout session with Stripe');
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
