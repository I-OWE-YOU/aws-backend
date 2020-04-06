import axios from 'axios';
import { failure, success } from '../libs/response-lib';
import { getEnvironment } from '../libs/utils-lib';

export const main = async event => {
  /**
   * @property {string} postalCode
   * @property {string} houseNumber
   */
  const { postalCode, houseNumber } = event.pathParameters;
  const env = getEnvironment();
  const geocodeEndpoint = env.GEOCODE_ENDPOINT;
  const apiKey = env.GEOCODE_API_KEY;
  const region = env.GEOCODE_REGION;

  try {
    const response = await axios.get(geocodeEndpoint, {
      params: {
        auth: apiKey,
        locate: postalCode,
        stnumber: houseNumber,
        region: region,
        json: '1'
      }
    });

    /** @type {import('../typings/address).Address} */
    const data = response.data;

    const address = {
      city: data.standard.city,
      houseNumber: houseNumber,
      latitude: data.latt,
      longitude: data.longt,
      street: data.alt.loc.streets.street_address.staddress,
      zipCode: postalCode
    };

    return success(address);
  } catch (e) {
    console.error(e);
    return failure('There has been an error');
  }
};
