require('dotenv').config();
const User = require('../models/User')
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');


// Google Client ID
const CLIENT_ID = '766512301906-rg9apma611ofu3od48bcghdktfkjreu7.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
 
const verifyGoogleToken = async (req, res) => {
  const { token } = req.body;
  console.log(req.body)
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(ticket,'ticket');
    console.log(payload,'payload');
    
    const { email, name, picture } = payload;
    console.log('Google User:', { email, name, picture });

    const [firstname, ...rest] = name.split(' ');
    const lastname = rest.join(' ') || 'N/A';   //handle cases with no lastname
    let user = await User.findOne({ email });      // Check if the user exists in the database
    if (!user) {
        user = new User({email, firstname, lastname, picture});
      await user.save();
      console.log('New user registered:', user);
    } else {
      if (!user.socialLogin || user.socialLogin !== 'google') {   // add the key for login user indentification 
        user.socialLogin = 'google';                         
        await user.save();  
      }
      console.log('Existing user found:', user);
    }  
    // Generate a JWT for the user *** 
    const tokenPayload = {
      id: user._id, 
      email: user.email,    
      firstname: user.firstname,
      lastname: user.lastname,
    };
    const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({
      message: 'User logged in successfully',
      user: { id: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname, picture: user.picture },
      token: jwtToken,
    });
    } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
    };
module.exports = verifyGoogleToken;
