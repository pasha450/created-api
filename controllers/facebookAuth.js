// this file handle the authentication process for the facebook 
const axios = require('axios');

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "557454496653455";
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || "your-facebook-client-secret";
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || "http://localhost:5000/auth/facebook/callback";

// Redirect to Facebook OAuth URL
const facebookLogin = (req, res) => {
  const redirectUri = `https://www.facebook.com/v15.0/dialog/oauth?app_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_CALLBACK_URL}&scope=email,public_profile`;
  res.redirect(redirectUri);
}

// Facebook OAuth callback
const facebookCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code not found.');

  }
  try {
    // Exchange authorization code for an access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v15.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_CLIENT_SECRET,
        redirect_uri: FACEBOOK_CALLBACK_URL,
        code,
      },
    });
    const { access_token: accessToken } = tokenResponse.data;

    
    if (!accessToken) {
      return res.status(401).send('Failed to retrieve access token.');
    }

    // Fetch user data from Facebook
    const userResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name,email,picture',    
      },
    });

    const userData = userResponse.data;
    // Send user data to the frontend or process it further
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('Facebook OAuth error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = { facebookLogin, facebookCallback };




