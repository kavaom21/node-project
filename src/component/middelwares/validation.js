import Validator from 'validatorjs';
import { sendError, formattedErrors } from '../utils/commonUtils.js';

const registerRules = {
  userName: 'required|string|min:3|max:50',
  email: 'required|string|min:4|max:255',
  password: "required|min:6|max:50|regex:/[A-Z]/|regex:/[0-9]/|regex:/[@$!%*#?&]/"
};

const loginRules = {
  email: 'required|string|min:4|max:255',
  password: "required|string|min:1|max:50"
};

const addressRules = {
  address: 'required|string|min:10|max:500'
};

export const validationMiddleware = (rules) => {
  return (req, res, next) => {
    const validation = new Validator(req.body, rules);

    if (validation.passes()) {
      req.validatedData = req.body;
      return next();
    }

    const errors = formattedErrors(validation.errors.errors);
    return res.status(400).json({
      success: 0,
      message: "Validation failed",
      errors
    });
  };
};

export const registerValidation = validationMiddleware(registerRules);
export const loginValidation = validationMiddleware(loginRules);
export const addressValidation = validationMiddleware(addressRules);

export { formattedErrors };

