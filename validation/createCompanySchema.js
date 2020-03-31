import Joi from '@hapi/joi';

export const companySchema = presenceMode =>
	Joi.object({
		email: Joi.string()
			.email()
			.presence(presenceMode),
		sub: Joi.string().presence(presenceMode)
	});
