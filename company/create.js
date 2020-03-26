import { v1 as uuidv1 } from 'uuid';
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { failure, success, validationError } from '../libs/response-lib';
import { createCompanySchema } from '../validation/createCompanySchema';

export const main = async event => {
  /** @type {import('../typings/company).Company} */
  const data = JSON.parse(event.body);

  try {
    await createCompanySchema.validateAsync(data, { abortEarly: false });
  } catch (e) {
    console.log(e);
    const errorMessages = e.details.map(detail => detail.message);
    return validationError(errorMessages);
  }

  const params = {
    TableName: process.env.COMPANIES_TABLE_NAME,
    Item: {
      companyId: uuidv1(),
      acceptedTerms: data.acceptedTerms,
      companyName: data.companyName,
      copyAcceptedTerms: data.copyAcceptedTerms,
      email: data.email,
      firstName: data.contactFirstName,
      lastName: data.companyLastName,
      iban: data.iban,
      kvk: data.kvk,
      city: data.address.city,
      houseNumber: data.address.houseNumber,
      street: data.address.street,
      zipCode: data.address.zipCode,
      latitude: data.address.latitude,
      longitude: data.address.longitude
    }
  };

  try {
    await dynamoDbLib.call('put', params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
};
