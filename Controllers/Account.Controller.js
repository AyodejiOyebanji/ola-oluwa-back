
const AccountModel= require('../Model/AccountModel');
const PaymentModel = require("../Model/PaymentModel");
require('dotenv');

const addAccounts = async (req, res, next) => {
  
    try {
        const Account = await AccountModel.create(req.body);
      
        res.json({ message: "Account added successfully", status: true });
      } catch (error) {
        if (error.name === 'ValidationError') {
          // Handle validation error
          return res.status(400).json({ message: error.message, status: false });
        } else if (error.name === 'MongoError' && error.code === 11000) {
          // Handle duplicate key error
          return res.status(409).json({ message: 'Account already exists', status: false });
        } else {
          // Handle other errors
          return next(error);
        }
      }

}
const getAccount = async (req, res, next) => {
    try {
        const account = await AccountModel.find();
        res.json({account, status:true});
       
      } catch (error) {
        next(error);
      }
}
const deleteAccount= async (req, res, next) => {
  try {
    const AccountId = req.body.deletedId;
    const deletedAccount = await AccountModel.findByIdAndDelete(AccountId);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account deleted successfully", status:true });
  } catch (error) {
    next(error);
  }

}

const getExpensesAccounts = async (req, res, next) => {
  try {
    const expensesAccounts = await AccountModel.find({ act_type: "400 Expenses" });
    res.json({ accounts: expensesAccounts, status: true });
  } catch (error) {
    next(error);
  }
};

const getBankAccountsAndCash = async (req, res, next) => {
  try {
    const accounts = await AccountModel.find({
      act_type: { $in: ["500 Bank", "300 Cash"] },
    });

    res.json({ accounts, status: true });
  } catch (error) {
    next(error);
  }
};
const getRawMaterialAccount= async (req, res, next) => {
  try {
    const accounts = await AccountModel.find({
      act_type: { $in: ["600 Raw Material",] },
    });

    res.json({ accounts, status: true });
  } catch (error) {
    next(error);
  }
}

const fetchAccountStatement = async (req, res, next) => {
  try {
    const accountId = req.params.id;

    // Fetch the account details using the accountId
    const account = await AccountModel.findById(accountId).select('title');

    // Fetch all payments with the specified account_id, sorted by createdAt in descending order
    const payments = await PaymentModel.find({ account_id: accountId })
      .sort({ createdAt: -1 })
      .exec();

    // Separate debit and credit transactions
    const debitTransactions = payments.filter((payment) => payment.transaction_type === 'Debit');
    const creditTransactions = payments.filter((payment) => payment.transaction_type === 'Credit');

    // Calculate the total amount for debit and credit transactions
    const totalDebit = debitTransactions.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCredit = creditTransactions.reduce((sum, payment) => sum + payment.amount, 0);

    // Send the payments, total amounts, and account name to the frontend
    res.status(200).send({
      payments,
      totalDebit,
      totalCredit,
      accountName: account ? account.title : 'Unknown Account',
      status: true,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Internal server error' });
  }
};



module.exports = {
    addAccounts,
     getAccount,
     deleteAccount,
     getExpensesAccounts,
     getBankAccountsAndCash,
     getRawMaterialAccount,
     fetchAccountStatement

  
}
