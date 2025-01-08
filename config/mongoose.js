
const mongoose  = require('mongoose');
const env = require('dotenv').config();
const database = process.env.MONGO_URI;


// console.log(database,"database111")
mongoose.connect(database)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));
