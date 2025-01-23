// **** server side  validation for forgetPassword *****
const { body , validationResult } = require('express-validator');
const User = require('../models/User')

const validateUser = () =>[
    body("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage(' Email can not be empty ')
    .bail() 
    .isString()
    .withMessage("email should be a valid string ")
    .bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
          return res.status(422).json({ errors: errors.array() });
        next();
    },
]
module.exports = validateUser();