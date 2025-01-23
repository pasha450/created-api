const express = require('express'); // Import express
const dotenv = require('dotenv');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session'); // Import express-session
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
      const fullName = profile._json.name || ""; // Default to an empty string if name is null
      const [firstname, ...lastnameParts] = fullName.split(' '); 
      const lastname = lastnameParts.join(' ') || "User"; // Default lastname to "User"  
      user = new User({
        firstname: firstname || "GitHub", // Default firstname to "GitHub"
        lastname: lastname, // Default lastname to "User" if empty
        email: profile._json.email || `${profile.username}@github.com`, // Fallback for email
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

passport.serializeUser((user, done) => {
  done(null, user.id);  // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Use async/await instead of a callback
    done(null, user); // Pass the user object to Passport
  } catch (err) {
    done(err); // Pass any errors
  }
});

// Middleware setup
app.use(cors()); // Allow cross-origin requests
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
    // On successful login, redirect to the dashboard
    res.redirect("http://localhost:3000/dashboard");  
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
