import { failure, success } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { getEnvironment } from '../libs/utils-lib';

export const main = async () => {
  const params = {
    TableName: getEnvironment().COMPANIES_TABLE_NAME,
    ProjectionExpression:
      'email, companyId, companyName, lastName, firstName, city, stripeUserId, longitude, iban, houseNumber, acceptedTerms, kvk, latitude, zipCode, street, isVerified'
  };

  let companies = [];
  let items;

  try {
    do {
      items = await dynamoDbLib.call('scan', params);
      items.Items.forEach(item => {
        if (item.isVerified && item.stripeUserId) {
          companies.push(item);
        }
      });
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != 'undefined');

    return success(companies);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
