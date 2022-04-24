const Joi = require("@hapi/joi");

const groupCreateInputValidation = (data) => {
  let schema;
  schema = Joi.object({
    group_title: Joi.string().required().min(2).messages({
      "string.empty": `Title should not be empty`,
      "string.min": `Title should have a minimum length of 2 characters`,
      "any.required": `Title is required`,
    }),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  groupCreateInputValidation,
};
