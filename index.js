const express = require('express'); // import express to create and configure the server 
const app = express();
const dotenv = require('dotenv');
const router = require('./routes');
const bodyParser = require("body-parser");
const PORT = 5000; 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());     // middleware to parse json 
app.use(express.static('./assets')) // static path for file images 
app.use('/', router); 

app.listen(PORT, () => {   // app.listen is used to start the server
    console.log(`Server is running on ${PORT}`);
});


