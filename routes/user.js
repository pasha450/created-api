const express =require('express')
const router = express.Router();
const User =require('../models/User');

const userApiController =require('../controllers/userApiControllers');

//set the route 
router.post('/destroy', userApiController.destroy);
router.get('/list',userApiController.listUsers); 


module.exports = router ;