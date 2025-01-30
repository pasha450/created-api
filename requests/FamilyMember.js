const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const validateUser = () => [
  body('firstName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('First name is required')
    .bail()
    .isString()
    .withMessage('First name should be in a valid format')
    .bail(),

  // Last Name
  body('lastName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Last name is required')
    .bail()
    .isString()
    .withMessage('Last name should be in a valid format')
    .bail(),

  // Email
  body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .bail()
    .custom((value) => {
      return User.findOne({ email: { $regex: new RegExp(`^${value}$`, 'i') } }).then((user) => {
        if (user) {
          return Promise.reject('Email is already in use');
        }
      });
    }),

  // Occupation
  body('occupation')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Occupation is required')
    .bail()
    .isString()
    .withMessage('Occupation should be in a valid format')
    .bail(),

  // Address
  body('address')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Address is required')
    .bail()
    .isString()
    .withMessage('Address should be in a valid format')
    .bail(),

  // Age
  body('age')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Age is required')
    .bail()
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be a valid number between 1 and 120')
    .bail(),

  // Contact
  body('contact')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Contact is required')
    .bail()
    .isMobilePhone()
    .withMessage('Please provide a valid contact number')
    .bail()
    .custom(async (value) => {
      const existingMember = await FamilyMember.findOne({ contact: value });
      if (existingMember) {
        throw new Error('Contact number already exists for another family member');
      }
    })
];
module.exports = validateUser();