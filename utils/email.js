const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlTotext = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Bharath Kishore <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // sending actual mail
  async send(template, subject) {
    //1) render html based on pug tamplate
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstname,
      url: this.url,
      subject
    });
    //2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlTotext.htmlToText(html)
      // html:
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome new user. There are lots of exciting thing to do, check all tours.'
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset link has been sent (Validity 10 mins)'
    );
  }
};
//const sendEmail = async options => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });
//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Bharath Kishore <hello@bk.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html:
//   };
//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
//};

//module.exports = sendEmail;
