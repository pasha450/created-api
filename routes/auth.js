const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const middleware = require('../config/middleware');
const verifyGoogleToken = require('../controllers/googleAuth');

//Controller 
const authApiController = require('../controllers/authApiControllers');

const registerUserRequest = require('../requests/RegisterUser');
const loginUserRequest = require('../requests/LoginUser');
const forgetPasswordRequest  = require('../requests/ForgetPassword');
const familyMemberRequest = require('../requests/FamilyMember');

//setup multer storage //
const storageProfileImg = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir  ='./assets/ProfileImage';
    if(!fs.existsSync(dir)){
       fs.mkdir(dir ,err =>callback(err, dir))
    }
    cb(null, dir); 
  },
  filename: (req, file, cb) => {
    console.log(file,'fileeee') 
    const fileName = file.originalname.toLowerCase().split( ' ' ).join('-');
    const newFileName = Date.now() +'-'+fileName;
    cb(null, newFileName); 
  }
});

 //upload profile_images(file validation checked )
 var uploadProfileImgImage = multer({
    storage: storageProfileImg,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }   
});


// set routes 
router.post('/register',registerUserRequest,authApiController.register);
router.post('/login',loginUserRequest, authApiController.login);
router.post('/forget-password',forgetPasswordRequest,authApiController.forgetPassword);
router.post('/reset-password',authApiController.resetPassword);
router.post('/edit-profile', middleware.verifyToken,uploadProfileImgImage.single('profile_image'),authApiController.editProfile);
router.post('/update-profile', middleware.verifyToken,uploadProfileImgImage.single('profile_image'),authApiController.updateProfile)
router.post('/auth/google', verifyGoogleToken);
router.post('/register-family',familyMemberRequest,authApiController.registerFamily)
module.exports = router;
