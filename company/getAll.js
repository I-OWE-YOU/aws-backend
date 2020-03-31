import { failure, resourceNotFound, success } from '../libs/response-lib';
import * as dynamoDbLib from '../libs/dynamodb-lib';

export const main = async () => {
	const params = {
		TableName: process.env.COMPANIES_TABLE_NAME,
		ProjectionExpression: 'email, companyId, companyName, lastName, firstName, city, stripeUserId, longitude, iban, houseNumber, acceptedTerms, kvk, latitude, zipCode, street'
	};

	let companies = [];
	let items;

	try {
		do {
			items = await dynamoDbLib.call('scan', params);
			items.Items.forEach((item) => companies.push(item));
			params.ExclusiveStartKey = items.LastEvaluatedKey;
		} while (typeof items.LastEvaluatedKey != "undefined");


		if (companies.length) {
			return success(companies);
		} else {
			return resourceNotFound({ status: false, error: 'Companies not found!' });
		}
	} catch (e) {
		return failure({ status: false });
	}
};