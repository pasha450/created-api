const User = require("../models/User");

module.exports = {
        destroy ,   
        listUsers,
}       

// for delete the user 
async function destroy(req,res){
    try{ 
    let{userId} = req.body
    let  result = await User.findByIdAndDelete(userId);
    res.status(200).json({ status:true ,message :'user deleted successfully ' })
    }catch(error) {
        console.log(error);
        res.status(500).json({status:failed , message :' delete data failed'})
     }
} 
//show the user list 

async function listUsers(req , res){
    try{
        const users =  await User.find({}); // fetch all users from the database
      if(!users || users.length ===0){
        return  res.status(404).json ({status: false , message :'No user found'})
      }
      res.status(200).json({status: true ,message: 'User Retrieved Successfully', data:users})
    }catch(error){
        console.log(error,'Error Fetching users')
        res.status(500).json({status:false ,message :'Internal server error'}) 
    }
}