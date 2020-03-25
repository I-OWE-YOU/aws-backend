/**
 * @typedef {Object} Address
 * @property {string} type
 * @property {string} id
 * @property {number} score
 * @property {AddressDetails} address
 * @property {Position} position
 * @property {Viewport}viewport
 */

/**
 * @typedef {Object} AddressDetails
 * @property {string} streetName
 * @property {string} municipalitySubdivision
 * @property {string} municipality
 * @property {string} countrySubdivision
 * @property {string} postalCode
 * @property {string} extendedPostalCode
 * @property {string} countryCode
 * @property {string} country
 * @property {string} countryCodeISO3
 * @property {string} freeformAddress
 * @property {string} localName
 */

/**
 * @typedef {Object} Position
 * @property {number} lat
 * @property {number} lon
 */

/**
 * @typedef {Object} Viewport
 * @property {Position} topLeftPoint
 * @property {Position} btmRightPoint
 */

exports.empty = {};
