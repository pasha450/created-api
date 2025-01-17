const User = require("../models/User");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const global = require("../_helper/GlobalHelper");
const mail = require("../config/mail");
const randomstring = require("randomstring");

module.exports ={
    register ,
    login ,
    forgetPassword,
    resetPassword,
    editProfile ,
    updateProfile,
}

async function register(req, res ) {
    try{
        const{name , email , password} =  req.body;
        const user = await User.findOne({email :email});
        if(user){
            return res.status(409).json({status: false , error:"Email already in use!"});
        }
        await User.create(req.body);
        res.status(200).json({status: true , message:"User Created Successfully"})
    }catch(error){
          console.error("Registration Error",error);
        res.status(500).json({Status: false , message:"Internal Server Error"})
    } 
}

// Login  
async function login(req,res){
    try {     
        const { email, password } = req.body;
        console.log(req.body,'req.body123112') 
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ status: false, error: 'Incorrect Email ID or Password !' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({status: false, error: 'Incorrect Email ID or Password !' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.SESSION_SECRET, {
            expiresIn: '2h',
        });
        user.token = token;  
        res.status(200).json({status: true, user,token  ,message:"User Login Successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Login failed' });
    }
}  
     
//forget Password 
async function  forgetPassword(req,res){
    try{
        const { email }  = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({status: false ,error :'User not Found!'})
        }  
        const randomStrings = randomstring.generate();
        const url = `${process.env.FRONTEND_URL}/reset-password/${randomStrings}`;
        let updated = await User.findByIdAndUpdate(user.id, {
         token: randomStrings,
        }); 
        res.status(200).json({status: true ,message: 'Password reset Email sent '})
    }catch(error){
        console.error(error);
        res.status(500).json({status: false , message :'Error sending password reset email'})
    }
}
// forget password ** ** ** 
async function resetPassword(req,res){
    try{
        const { token , password , confirmPassword } = req.body
        let result = token.trim()
        let hash = await global.securePassword(password);
        if(password != confirmPassword){
            res.status(500).json({status:false , error :' Password and Confirm Password are not matched'})
        } 
        let tokenData = await User.findOne({ token : result })
        if(tokenData){
            let updated = await User.findByIdAndUpdate(tokenData.id,{password: hash , token:" " ,})
            res.status(200).json({status: true , message :'Password changed successfully'})
        }else{
            res.status(404).json({status: false , message:' this Link has been expired ! or invalid Link'})
        }   
    }catch(error){
        console.error('Reset password error:',error);
        res.status(500).json({status : false , message :'Reset password failed'})
    }   
}
// Api for Edit profile 
async function  editProfile(req,res){
  try{
      const {userId} = req.body 
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const profileImageUrl = `${baseUrl}/ProfileImage`;

      const userData = await User.findById(userId);
      console.log(userData ,"userDataaaa");
    if(!userData){
       res.status(404).json({status : false , error: 'user not found'})
    }
    // Update user fields only if the new value is provided 
    if(userData!=null && userData.profile_image!=''){
        userData.profile_image = `${profileImageUrl}/${userData.profile_image}`
    }
    res.status(200).json({status:true ,userData})
  }catch(error){
   console.log(error)
   res.status(500).json({ status : false , error: 'Profile update Failed'})
  } 
}


// for update the profile  ************ 

async function updateProfile(req, res) {
    try {
        const { userId, password, phone, address, gender } = req.body;
        const updateData = { ...req.body };
        let baseUrl = process.env.App_URL;
        // Handle file upload
        if (req.file) { // Check if req.file exists
            const profileImage = updateData.profile_image || ''; // Ensure profile_image has a default value
            const filePath = `./assets/profileImage/${profileImage}`;
            
            // Delete old image if it exists
            if (profileImage) {
                fs.exists(filePath, function (exists) {
                    if (exists) {
                        fs.unlinkSync(filePath);
                    } else {
                        console.log('File not found, so not deleting');  
                    }
                });
            }

            // Set new profile image
            updateData.profile_image = req.file.filename;
        } else {
            delete updateData.profile_image; // Remove invalid data if no file is uploaded
        }
        // Handle password encryption
        if (password) {
            updateData.password = await global.securePassword(password);
        } else {
            delete updateData.password;
        }
        // Add phone, address, and other fields
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (gender) updateData.gender = gender;

        // Update the user data
        const userData = await User.findByIdAndUpdate(userId, updateData, { new: true });

        // Set profile image URL
        if (req.file) {
            userData.profile_image = `${baseUrl}/ProfileImage/${req.file.filename}`;
        }

        res.status(200).json({ status: true, userData });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
}



