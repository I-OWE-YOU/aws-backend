import axios from 'axios';
import { failure, success } from '../libs/response-lib';

export const main = async event => {
  /**
   * @property {string} postalCode
   * @property {string} houseNumber
   */
  const { postalCode, houseNumber } = event.pathParameters;
  const addressEndpoint = process.env.AZURE_MAPS_ADDRESS_ENDPOINT;
  const clientId = process.env.AZURE_MAPS_CLIENT_ID;
  const mapsKey = process.env.AZURE_MAPS_KEY;

  try {
    const response = await axios.get(
      `${addressEndpoint}?countryCode=NL&api-version=1.0`,
      {
        headers: {
          'x-ms-client-id': clientId
        },
        params: {
          'subscription-key': mapsKey,
          postalCode: postalCode.replace(' ', ''),
          houseNumber
        }
      }
    );

    /** @type {import('../typeings/address).Address} */
    const data = response.data.results[0];

    const address = {
      city: data.address.localName,
      houseNumber: houseNumber,
      latitude: data.position.lat,
      longitude: data.position.lon,
      street: data.address.streetName,
      zipCode: postalCode
    };

    return success(address);
  } catch (e) {
    console.log(e);
    return failure('There has been an errpr');
  }
};
