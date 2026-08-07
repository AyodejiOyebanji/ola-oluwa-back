const User = require('../Model/UserModel');
require('dotenv');


const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

const JWT_KEY = process.env.JWT_KEY



const register = async (req, res) => {
  const { fname, lname, email, phone, role, isAdmin, isCashier, isStaff, bankname, acct_no, acct_name } = req.body;

  // Single query to check both email and phone at once (was 2 separate queries)
  const existingUser = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { phone }] });
  if (existingUser) {
    const conflict = existingUser.email === email?.toLowerCase() ? 'Email' : 'Phone Number';
    return res.status(409).send({ success: false, message: `${conflict} already exists` });
  }

  // generate smato_id for the new user
  const lastUser = await User.findOne().sort({ smato_id: -1 }).limit(1).select('smato_id').lean();
  const smato_id = lastUser ? lastUser.smato_id + 1 : 1;

  bcrypt.hash(fname, 10, function (err, hashedPass) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "An error has occurred while registering the user, please try again!"
      });
    }

    let user = new User({
      smato_id,
      fname,
      lname,
      email: email.toLowerCase(),
      phone,
      role,
      isAdmin,
      isCashier,
      isStaff,
      password: hashedPass,
      bankname,
      acct_no,
      acct_name,
    });

    user.save()
      .then(savedUser => {
        return res.json({ success: true, message: 'Registered successfully!', user: savedUser });
      })
      .catch(err => {
        if (err.keyPattern) {
          return res.status(500).json({ success: false, error: "Email, Phone Number and username must be unique" });
        }
        return res.status(400).json({ success: false, message: 'An error has occurred while registering the user, please try again!' });
      });
  });
}

  
const verifyEmail = async (email, res) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: 'User not found', status: false });
    }

    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_ACCOUNT,
      to: email,
      subject: 'SmatoLTD',
      html: `
        <div style="background-color: #f8f8f8; padding: 20px;">
          <h1 style="color: #0072c6; text-align: center;">SamtoLTD Verification Code</h1>
          <p style="font-size: 16px;">Dear ${user.name},</p>
          <p style="font-size: 16px;">Your verification code is:</p>
          <h2 style="color: #0072c6; text-align: center;">${user.confirm_email_pin}</h2>
          <p style="font-size: 16px;">Please enter this code to verify your email address.</p>
        </div>
      `,
    };

    const info = await mailTransporter.sendMail(mailOptions);
  //   res.status(200).send({ message: 'Verification email sent successfully', status: true });
  } catch (err) {
   
  //   res.status(500).send({ message: 'Error sending verification email', status: false });
  }
};
const confirmPin = async (req,res)=>{
  try{
    const user= await User.findOne({email:req.body.email})
        if(!user){
            return res.status(404).send({ message: 'User not found', status: false });
        }
        if (req.body.userpin != user.confirm_email_pin) {
            return res.send({ message: 'Invalid Code', status: false });
          }else{
            
              return res.send({ message: 'Valid Code, Proceed to Login ', status: true });
          }

          
}catch(err){
    return res.status(500).send({ message: 'Internal Server Error', status: false });

}
}

const login = (req, res) => {
  let { email, password, phone } = req.body;
  if (!(email && password)) {
    return res.status(400).send({ message: "All input is required" });
  }
  User.findOne({ $or: [{ email: email.toLowerCase() }, { email: phone }] }).then(user => {
    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          return res.json({ error: err });
        }
        if (result) {
          // Access token valid for 8h; refresh token valid for 7 days
          const accessToken = jwt.sign({ user_id: user._id, email }, JWT_KEY, { expiresIn: '8h' });
          const refreshToken = jwt.sign({ user_id: user._id, email }, JWT_KEY, { expiresIn: '7d' });
          return res.status(200).send({
            success: true,
            message: 'Login successful',
            token: accessToken,
            refreshToken,
          });
        } else {
          return res.status(400).send({ success: false, message: 'Incorrect Password' });
        }
      });
    } else {
      return res.status(400).send({ success: false, message: 'Invalid Credentials' });
    }
  });
}

const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).send({ success: false, message: 'Refresh token required' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_KEY);
    const accessToken = jwt.sign({ user_id: decoded.user_id, email: decoded.email }, JWT_KEY, { expiresIn: '8h' });
    return res.status(200).send({ success: true, token: accessToken });
  } catch (err) {
    return res.status(401).send({ success: false, message: 'Invalid or expired refresh token' });
  }
}



  module.exports = {
    register,
    confirmPin,
    login,
    refreshToken,
}
