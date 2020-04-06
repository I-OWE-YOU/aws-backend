/**
 * @typedef {Object} Environment
 * @property {string} GEOCODE_API_KEY
 * @property {string} GEOCODE_ENDPOINT
 * @property {string} GEOCODE_REGION
 * @property {string} COMPANIES_TABLE_NAME
 * @property {string} USERS_TABLE_NAME
 * @property {string} STRIPE_API_SECRET_KEY
 * @property {string} STRIPE_API_CLIENT_ID
 * @property {string} STRIPE_CONNECT_URL
 * @property {string} APPLICATION_URL
 * @property {string} STRIPE_CHECKOUT_REDIRECT_SUCCESS
 * @property {string} STRIPE_CHECKOUT_REDIRECT_CANCEL
 * @property {boolean=} IS_OFFLINE
 */

/**
 * Wrapper to get typed environment variable
 * @returns {Environment | NodeJS.ProcessEnv}
 */
export function getEnvironment() {
    return process.env;
}