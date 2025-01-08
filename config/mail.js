const nodemailer = require('nodemailer');

const ejs = require('ejs');
const path =require('path');
let transporter  = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b576ccfb39fdff",
      pass: "3d7a7796307f62"
    } 
  });
  let renderTemplate = (token,relativePath) => {
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, '../template', relativePath),
        token,
        function(err, template){
            if (err){console.log('error in rendering template',err); return}
            mailHTML = template;
        }
    )
    return mailHTML;
  }

module.exports = {
    
    transporter: transporter,
    renderTemplate : renderTemplate
}