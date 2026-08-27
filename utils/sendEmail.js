const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = process.env.EMAIL_PORT || 587;

  let transporter;
  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort == 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    console.warn("WARNING: EMAIL_USER and EMAIL_PASS not set. Emails will be logged to console instead of sending.");
    transporter = {
      sendMail: async (mailOptions) => {
        console.log("==========================================");
        console.log("MOCK EMAIL SENT:");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("Text:", mailOptions.text);
        console.log("==========================================");
        return { messageId: "mock-id-1234" };
      }
    };
  }

  const mailOptions = {
    from: `"RUET OneHUB Verification" <${emailUser || "noreply@onehub.edu"}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
