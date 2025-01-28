const express = require('express'); // Import express
const dotenv = require('dotenv');
const passport = require('passport');
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session'); // Import express-session
const FacebookStrategy = require('passport-facebook').Strategy; // Facebook Strategy
const cors = require('cors');
const router = require('./routes');
const User = require("./models/User");

dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 5000;


// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
}, async (accessToken, refreshToken, profile, done) => {

  try {
    // Check if the user already exists in the DB 
    let user = await User.findOne({ githubId: profile.id });
    if (!user) { 
      // If the user doesn't exist, create a new user
      const fullName = profile._json.name || ""; 
      const [firstname, ...lastnameParts] = fullName.split(' '); 
      const lastname = lastnameParts.join(' ') || "User";
    //  console.log(lastname ,"lastname");
      user = new User({
        firstname: firstname || "GitHub", 
        lastname: lastname, 
        email: profile._json.email || `${profile.username}@github.com`, 
        githubId: profile.id,
        avatar: profile._json.avatar_url, 
      });
      await user.save(); 
    }
    // Pass the user profile to the session
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Passport Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:5000/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'], // Fields you want from Facebook
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists in your DB
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          // Create a new user if not found
          user = new User({
            firstname: profile.name.givenName || "Facebook",
            lastname: profile.name.familyName || "User",
            email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
            facebookId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });
          await user.save();
        }
        done(null, user); // Pass the user object to Passport
      } catch (err) {
        done(err);
      }
    }
  )
);
// Passport twitter Strategy

// passport.use(
//   new TwitterStrategy(
//     {
//       consumerKey: process.env.TWITTER_CONSUMER_KEY,
//       consumerSecret: process.env.TWITTER_CONSUMER_SECRET, 
//       callbackURL: process.env.TWITTER_CALLBACK_URL || "http://localhost:5000/auth/twitter/callback",
//     },
//     function (token, tokenSecret, profile, done) {
//       return done(null, profile);   // Save or find the user in the databasse
//     }
//   )
// );

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || "http://localhost:5000/auth/twitter/callback",
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ twitterId: profile.id });
        if (!user) {
          // Create a new user if not found
          user = new User({
            twitterId: profile.id,
            username: profile.username,
            firstname: profile.displayName.split(" ")[0] || "Twitter",
            lastname: profile.displayName.split(" ")[1] || "User",
            email: profile.emails?.[0]?.value || `${profile.id}@twitter.com`, 
            avatar: profile.photos?.[0]?.value, 
            socialLogin: "twitter", 
          });
          await user.save();
        }
        // Pass the user object to Passport
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);  // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Use async/await instead of a callback
    done(null, user); // Pass the user object to Passport
  } catch (err) {
    done(err); 
  }
});

// Middleware setup
app.use(cors()); 
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json()); // Parse JSON data
app.use(express.static('./assets')); // Serve static files

// Session setup for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


// GitHub login route
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user; // User is attached to req.user by Passport
    res.redirect(`http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(user))}`); 
  }
);  
// Facebook login route
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user; // User is attached to req.user by Passport
    res.redirect(`http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

// Twitter login route
app.get("/auth/twitter", passport.authenticate("twitter", { scope: ['email'] }));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    res.redirect(`http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

// Profile page to show user info
app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/'); 
  }
  res.json(req.user); // You can display user data here
});
app.use('/', router); 

// Start the server
app.listen(PORT, () => { 
  console.log(`Server is running on port ${PORT}`);
});
