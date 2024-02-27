import { RequestHandler } from 'express';
import * as yup from 'yup';

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body)
      return res.status(422).json({
        error: 'Incomplete fields. Please provide requested details.',
      });

    const schemaToValidate = yup.object({
      body: schema,
    });

    let validationErrors: any;
    try {
      schemaToValidate.validateSync({ body: req.body }, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        validationErrors = {};
        for (const err of error.inner) {
          const path = err.path!.split('.')[1];
          validationErrors[path] = err.errors[0] || err.errors[1];
        }
        res.status(422).send({ validationErrors });
      }
    }
  };
};
