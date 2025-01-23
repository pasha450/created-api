const axios = require('axios');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Ov23li27KMnGLMGrcgPN";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "b861b7257359655eda2df4f5b96f6aa61cae4bbb";
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback";

// Redirect to GitHub OAuth URL
const githubLogin = (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}`;
  res.redirect(redirectUri);
  console.log(redirectUri,'redirectUri 143341')
};

const githubCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code not found.');
  }
  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );
    const { access_token: accessToken } = tokenResponse.data;
    if (!accessToken) {
      return res.status(401).send('Failed to retrieve access token.');
    }
    // Fetch user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(userResponse,'userResponse 11234567')

    const userData = userResponse.data;
    console.log(userData,'userDataaaa')
    
    // Send user data to the frontend
    res.status(200).json({ success: true,user: userData,  });
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = {  githubLogin, githubCallback,};
