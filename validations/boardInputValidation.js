const Joi = require("@hapi/joi");

const boardCreateInputValidation = (data) => {
  let schema;
  schema = Joi.object({
    board_title: Joi.string().required().min(2).messages({
      "string.empty": `Title should not be empty`,
      "string.min": `Title should have a minimum length of 2 characters`,
      "any.required": `Title is required`,
    }),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  boardCreateInputValidation,
};
