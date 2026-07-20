const nodemailer = require("nodemailer");
const logger = require("../logger"); // Adjust the path as needed

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify the transporter when the application starts
transporter.verify((error, success) => {
  if (error) {
    logger.error(
      { err: error },
      "Failed to initialize Nodemailer transporter"
    );
  } else {
    logger.info("Nodemailer transporter initialized successfully.");
  }
});

module.exports = transporter;