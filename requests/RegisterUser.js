const {body , validationResult} = require('express-validator')
const User = require('../models/User');

const validateUser =() =>[
    body("firstname")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Name must be required")
    .bail()
    .isString()
    .withMessage("Name should be in a validd format")
    .bail()  ,  // stop further validation if the is invalid format 

    // for lastname
    body("lastname")
    .trim()
    .not()
    .isEmpty()
    .withMessage("LastName must be required")
    .bail()
    .isString()
    .withMessage("Name should be in a valid format")
    .bail()  ,
    
// ** for Email **//
   body("email")
   .trim()
   .not()
   .isEmpty()
   .withMessage("Email can't be Empty")
   .bail()
   .isEmail()
   .withMessage("Please Provide valid Email Address")
   .bail()
   .custom((value) => {
    return User.findOne({ email: { $regex: new RegExp(`^${value}$`, 'i') } }).then((user) => {
      if (user) {
        return Promise.reject('Email is already in use!');
      }
    });
  }),
// *** for Password *** // 
    body('password')
    .not()
    .isEmpty() 
    .withMessage('Password field is required.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .bail()
    .custom((value) => {
    const UpperCase = /[A-Z]/.test(value);
    const LowerCase = /[a-z]/.test(value);
    const Number = /\d/.test(value);
    const SpecialChar = /[@$!%*?&]/.test(value);
    const NoWhitespace = /\s/.test(value);
    if (!UpperCase || !LowerCase || !Number || !SpecialChar || NoWhitespace) {
        throw new Error('Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and no whitespace.');
    }
    return true;
    })
    .bail(),

    (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors,'got it ,okieee')
    if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
    next();
    },

]
module.exports = validateUser();