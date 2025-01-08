
// Server side validation for login 

const {body, validationResult} = require('express-validator');

const validateUser =() =>[
    body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email can not be empty')
    .bail()
    .isString()
    .withMessage('email must be in valid format')
    .bail(),
    

     
    // **** validation for password****
    body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password must be required')
    .bail()
    .isString()
    .withMessage('Password must be contain at least one specialchar,one uppercase ,one lowercase,one number or no whitespace')
    .bail(),
    (req,res,next) =>{
        const login = validationResult(req)
        console.log(login,'leja lejaa re')
        if(!login.isEmpty)
           return res.status(422).json({login:login.array()});
        next();
    }
]
module.exports = validateUser();
