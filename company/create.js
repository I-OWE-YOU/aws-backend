import { v1 as uuidv1 } from 'uuid';
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { failure, success } from '../libs/response-lib';

export const main = async event => {
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Item: {
      companyId: uuidv1(),
      // acceptedTerms: data.acceptedTerms,
      companyName: data.companyName
      // copyAcceptedTerms: data.copyAcceptedTerms,
      // email: data.email,
      // firstName: data.contactFirstName,
      // lastName: data.companyLastName,
      // iban: data.iban,
      // city: data.address.city,
      // houseNumber: data.address.houseNumber,
      // street: data.address.street,
      // zipCode: data.address.zipCode,
      // latitude: data.address.latitude,
      // longitude: data.address.longitude
    }
  };

  // return success(params);

  try {
    await dynamoDbLib.call('put', params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }

  return success('Create a new company');
};
