const Joi = require('joi');

exports.createBookingSchema = Joi.object({
  customer_id: Joi.number().required(),

  test_ids: Joi.array()
    .items(Joi.number())
    .min(1)
    .required(),

  scheduled_date: Joi.date().required(),

  scheduled_time: Joi.string().required(),

  discount_type: Joi.string()
    .valid('FLAT', 'PERCENTAGE')
    .optional(),

  discount_value: Joi.number()
    .positive()
    .optional()
});
