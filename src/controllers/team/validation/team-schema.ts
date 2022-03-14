import { body } from 'express-validator';

const schema = [
    body('name')
        .exists()
        .withMessage('name cannot be empty'),
    body('countryCode')
        .exists()
        .withMessage('countryCode cannot be empty'),
    body('flag')
        .exists()
        .withMessage('flag cannot be empty'),
    body('region')
        .exists()
        .withMessage('region cannot be empty'),
];

export { schema as teamValidationSchema };