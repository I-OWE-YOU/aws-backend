import Joi from '@hapi/joi';

export const companySchema = presenceMode =>
  Joi.object({
    companyName: Joi.string()
      .min(3)
      .max(30)
      .presence(presenceMode),

    acceptedTerms: Joi.bool().presence(presenceMode),
    copyAcceptedTerms: Joi.bool().presence(presenceMode),
    email: Joi.string()
      .email()
      .presence(presenceMode),
    contactFirstName: Joi.string().presence(presenceMode),
    contactInsertion: Joi.string().presence(presenceMode),
    contactLastName: Joi.string().presence(presenceMode),
    iban: Joi.string().presence(presenceMode),
    kvk: Joi.number()
      .integer()
      .min(10000000)
      .max(99999999)
      .presence(presenceMode)
      .messages({
        'number.min': '"kvk" should be 8 digits long',
        'number.max': '"kvk" should be 8 digits long'
      }),
    address: Joi.object({
      city: Joi.string().presence(presenceMode),
      houseNumber: Joi.string().presence(presenceMode),
      street: Joi.string().presence(presenceMode),
      zipCode: Joi.string().presence(presenceMode),
      latitude: Joi.number().presence(presenceMode),
      longitude: Joi.number().presence(presenceMode)
    })
  });
