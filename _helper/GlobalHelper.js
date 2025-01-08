const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");


module.exports = {
  baseUrl,
  securePassword,
  encryptData
};

function baseUrl(req) {
  const url = req.protocol + "://" + req.headers.host;
  return url;
}


async function securePassword(password) {
  try {
      
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);
      return hash;
  } catch (error) {
      console.error('Error in hashing password:', error);
      throw error; // Throw error to handle it in calling function
  }
    
}
const secretPass = process.env.SESSION_SECRET;
async function encryptData(text) {
    const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(text),
    secretPass
    ).toString();
    return encryptedData;
};
