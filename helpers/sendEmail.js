const nodemailer = require("nodemailer");
require("dotenv").config;

const { META_PASSWORD } = process.env;

const config = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "oleksandr.sh3pel@meta.ua",
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(config);

const sendEmail = async ({to, subject, text, html, from = "oleksandr.sh3pel@meta.ua"}) => {
  await transport.sendMail({ from, to, subject, text, html,});
};

module.exports = {
  sendEmail,
}