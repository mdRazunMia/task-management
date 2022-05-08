const Joi = require("@hapi/joi");

const taskCreateInputValidation = (data) => {
  let schema;
  schema = Joi.object({
    task_title: Joi.string().required().messages({
      "string.empty": `Title should not be empty`,
      "any.required": `Title is required`,
    }),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  taskCreateInputValidation,
};
