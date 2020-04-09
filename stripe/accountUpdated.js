import { success } from '../libs/response-lib';

export const main = async event => {
  console.log(event);

  return success({ status: true });
};
