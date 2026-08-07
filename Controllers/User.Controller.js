const User = require('../Model/UserModel');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const PaymentModel = require('../Model/PaymentModel');
require('dotenv');
const JWT_KEY = process.env.JWT_KEY

const getDashboard = async (req, res) => { 
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_KEY, async (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Timed out', err, status: false });
        } else {
            const email = result.email;
           
            try {
                const user = await User.findOne({ email: email }).exec();
                res.send({ message: 'Welcome', status: true, result: user });
            } catch (error) {
                res.status(500).send({ message: 'Error finding user', error, status: false });
            }
        }
    });
}
const getCurrentUser= async (req,res)=>{
    try {
        const currentUser = await User.findOne({ email: req.params.currentUser });
        res.send({ status: true, currentUser });
      } catch (err) {
        res.status(500).send({ message: 'Internal server error', status: false });
      }

}

const updateProfile = async (req, res) => {
    const { fname, lname, email, phone, password, bankname,
      acct_no,
      acct_name  } = req.body;
  
    let hashedPass = password;
    if (!password.startsWith("$2a$10$")) {
      hashedPass = await bcrypt.hash(password, 10);
    }
  
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          fname: fname,
          lname: lname,
          phone: phone,
          email:email,
          password: hashedPass,
          bankname:  bankname ,
      acct_no:acct_no,
      acct_name:acct_name

        },
      },
      { new: true }
    );
  
    if (updatedUser) {
      res.status(200).send({
        status: true,
        message: "User profile updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(500).send({
        status: false,
        message: "An error has occurred while updating user profile",
      });
    }
  };
  
const getTotalExpenses  = async (req, res) => {
  try {
    // Find all records where transaction_type is "debit"
    const debitPayments = await PaymentModel.find({ transaction_type: 'Debit' });

    // Sum up all the amounts
    const totalExpenses = debitPayments.reduce((total, payment) => total + payment.amount, 0);

    // Now, totalExpenses contains the sum of amounts for all "debit" transactions
    res.status(200).json({ totalExpenses });
  } catch (error) {
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
const fetchAllStaffs = async (req, res) => {
  try {
    // Assuming your User model has a field named "smato_id"
    const excludedSmatoIds = [1, 2];

    // Fetch all staffs excluding those with smato_id 1 and 2
    const staffs = await User.find({ smato_id: { $nin: excludedSmatoIds } });

    res.status(200).json({ staffs, status: true });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

module.exports = {
    getDashboard ,
    getCurrentUser,
    updateProfile,
    getTotalExpenses,
    fetchAllStaffs
}
