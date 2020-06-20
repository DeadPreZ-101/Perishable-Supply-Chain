const validator = require('express-validator');

exports.registration = [

    validator
        .body('name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Name must be specified.')
        .isAlphanumeric()
        .withMessage('Name has non-alphanumeric characters.')
        .escape(),
    validator
        .body('password')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Password must be specified.')
        .escape(),
    validator
        .body('address', 'Invalid date of birth')
        .trim()
        .isLength({ min: 40, max: 42 })
        .withMessage('Address must be specified.')
        .matches(/^(0x)?[\d\w]{40}$/)
        .withMessage('Invalid address.')
        .escape(),
    validator
        .body('registration_date', 'Invalid registration date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .escape()
]

exports.login = [

    validator
        .body('name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Name must be specified.')
        .isAlphanumeric()
        .withMessage('Name has non-alphanumeric characters.')
        .escape(),
    validator
        .body('password')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Password must be specified.')
        .escape()
]