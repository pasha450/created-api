const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({

  firstname: {
    type: String,
    required: [true, "Path `firstname` is required."],
  },
  lastname: {
    type: String,
    required: [true, "Path `lastname` is required."],
  },
  email: {
    type: String,
      required: [true, "Path `email` is required."],
      required: true,
      caseInsensitive: true 
    },

    socialLogin:{  // new field for social login 
      type: String,
      default:null
    },

    githubId: { 
      type: String,
      unique: true,
    },
    username: { 
      type: String,
      required: false,
    },
    avatar: { 
      type: String,
      required: false,
    },
    twitterId: { 
      type: String 
    },
    password: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      // required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female",]
    },
    address: {
        type: String,
        default: "",
      },
    token: {
      type: String,
      default: "",
    },
    profile_image: {
      type: String,
      default: "",
    },
    status: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
   
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});
 
// Method to compare passwords
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("users", userSchema);
module.exports = User;
