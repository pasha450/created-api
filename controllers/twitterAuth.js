const axios = require("axios");

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || "60Elxzz7DA3cCAU71sd4H11Uo";
const TWITTER_CONSUMER_SECRET = process.env.CONSUMER_SECRET || "I2GQ9qhebQoh8zxjCmxm8VDWME3kzOh455t4f4NgCcZkysmcsT";
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || "http://localhost:5000/auth/twitter/callback";

// Function to get a request token from Twitter
const getRequestToken = async () => { 
  const url = "https://api.twitter.com/oauth/request_token";
  const credentials = Buffer.from(`${TWITTER_CONSUMER_KEY }:${TWITTER_CONSUMER_SECRET}`).toString("base64"); 
  try {
    const response = await axios.post(url, null, {  
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
         
      },
      params: {
        oauth_callback: TWITTER_CALLBACK_URL,
      },
    });
    const data = new URLSearchParams(response.data);
    const oauthToken = data.get("oauth_token");
    const oauthTokenSecret = data.get("oauth_token_secret");
    return { oauthToken, oauthTokenSecret };
  } catch (error) {
    console.error("Error fetching request token:", error.response?.data || error.message);
    throw new Error("Failed to get request token.");
  }
};
// Redirect to Twitter OAuth URL **
const twitterLogin = async (req ,res) => {
  try {
    const { oauthToken } = await getRequestToken();
    const twitterAuthUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
    res.redirect(twitterAuthUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to initiate Twitter login.",});
  }
};
// Twitter OAuth callback

const twitterCallback = async (req, res) => {
  const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = req.query;
  if (!oauthToken || !oauthVerifier) {
    return res.status(400).send("OAuth token or verifier not found.");
  }

  try {
    // Exchange the oauth_token and oauth_verifier for access tokens
    const url = "https://api.twitter.com/oauth/access_token";
    const response = await axios.post(url, null, {
      params: {
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
      },
    });

    const data = new URLSearchParams(response.data);
    const accessToken = data.get("oauth_token");
    const accessTokenSecret = data.get("oauth_token_secret");
    const userId = data.get("user_id");
    const screenName = data.get("screen_name");
    if (!accessToken || !userId) {
      return res.status(401).send("Failed to retrieve access token."); 
    }
    // Fetch user profile data (optional, using Twitter API v2 for extended data)
    const userResponse = await axios.get(`https://api.twitter.com/2/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userData = userResponse.data;
    // Send user data to the frontend or process it further
    res.status(200).json({ success: true,  user: { id: userId,screenName,  profile: userData,},});
  } catch (error) {
    console.error("Twitter OAuth error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

module.exports = { twitterLogin, twitterCallback };
