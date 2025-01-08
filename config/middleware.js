const jwt = require('jsonwebtoken');
const env = require('dotenv').config();


//verify token 
module.exports.verifyToken = function verifyToken(req, res, next){
    const token = req.header('Authorization');
    if(!token)
          return res.status(401).json({error:'Access denied'});
        try{
            const decoded = jwt.verify(token, process.env.SESSION_SECRET)
            req.userId = decoded.userId;
            next();
        }catch(error){  
            res.status(401).json({error :'invalid token'});
        }     
}

