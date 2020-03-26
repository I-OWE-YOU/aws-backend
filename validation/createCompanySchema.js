import Joi from '@hapi/joi';

export const createCompanySchema = Joi.object({
  companyName: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  acceptedTerms: Joi.bool().required(),
  copyAcceptedTerms: Joi.bool().required(),
  email: Joi.string()
    .email()
    .required(),
  contactFirstName: Joi.string().required(),
  companyLastName: Joi.string().required(),
  iban: Joi.string().required(),
  address: Joi.object({
    city: Joi.string().required(),
    houseNumber: Joi.string().required(),
    street: Joi.string().required(),
    zipCode: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
  })
});
