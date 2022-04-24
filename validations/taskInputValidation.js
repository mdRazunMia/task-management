const Joi = require("@hapi/joi");

const taskCreateInputValidation = (data) => {
  let schema;
  schema = Joi.object({
    task_title: Joi.string().required().min(6).messages({
      "string.empty": `Title should not be empty`,
      "string.min": `Title should have a minimum length of 6 characters`,
      "any.required": `Title is required`,
    }),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  taskCreateInputValidation,
};
