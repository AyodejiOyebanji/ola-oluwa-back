const PayrollModel = require("../Model/PayrollModel");
const PaymentModel = require("../Model/PaymentModel");
const AccountModel = require("../Model/AccountModel");
require("dotenv");

    const createPayroll = async (req, res, next) => {
        try {
          // Check if available amount is sufficient
          const account = await AccountModel.findById(req.body.account_id);
          if (!account) {
            return res.status(404).json({ status: false, message: "Account not found" });
          }
          if (account.availableamount < req.body.total) {
            return res.status(400).json({
              status: false,
              message: "Insufficient funds in the selected account",
            });
          }

          // Build payment and payroll objects
          const currentYear = new Date().getFullYear();
          const randomNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 100));

          const payment = {
            description: `Payroll:${req.body.month}${currentYear} id${randomNumbers}`,
            amount: req.body.total,
            account_id: req.body.account_id,
            sender: req.body.preparedBy,
            receiver: "",
            transaction_type: "Debit",
          };

          const payrollData = {
            account_id: req.body.account_id,
            month: req.body.month,
            payrollItem: req.body.payrollItem,
            total: req.body.total,
            preparedBy: req.body.preparedBy,
          };

          // Save payment and payroll in parallel, update account balance concurrently
          const [savedPayment, savedPayroll] = await Promise.all([
            PaymentModel.create(payment),
            PayrollModel.create(payrollData),
            AccountModel.findByIdAndUpdate(req.body.account_id, {
              availableamount: account.availableamount - req.body.total,
            }),
          ]);

          res.status(200).json({
            status: true,
            message: "Payroll created successfully",
            payroll: savedPayroll,
            payment: savedPayment,
          });
        } catch (error) {
          res.status(500).json({ status: false, message: "Internal server error" });
        }
 };
const fetchallpayroll = async (req, res, next) => {
  try {
    const payroll = await PayrollModel.find().sort({ createdAt: -1});
    res.json({ payroll, status: true });
  } catch (error) {
    next(error);
  }
};

const fetcheachpayroll = async (req, res, next) => {
  // console.log(req.params);
  try {
    const { id } = req.params;

     // Find payroll by ID
     const payroll = await PayrollModel.findById(id);
  

    if (!payroll) {
      return res.status(404).json({ status: false, message: 'Payroll not found' });
    }

    // Find account by account_id in the payroll
    const account = await AccountModel.findById(payroll.account_id);

    if (!account) {
      return res.status(404).json({ status: false, message: 'Account not found for the payroll' });
    }

    // Combine payroll and account details
    const result = {
      payroll: payroll,
      account: account
    };

    res.status(200).json({ status: true, result: result });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

const downloadpayroll = async (req, res, next) => {
  try {
    const { payroll_id, option } = req.query;
    
    // Fetch payroll data based on payroll_id
    const payrollData = await PayrollModel.findById(payroll_id);

    if (!payrollData) {
      return res.status(404).json({ error: 'Payroll not found', status: false });
    }

    // Construct the response based on the option
    let formattedData;
  

    if (option === 'audit') {
      // Send all columns in payrollItem for audit option
      formattedData = payrollData.payrollItem.map((item) => ({
        'Name': item.name,
        'Wages': `₦${item.wages.toFixed(2)}`,
        'Bonus': `₦${item.bonus.toFixed(2)}`,
        'Tax': `₦${item.tax.toFixed(2)}`,
        'No of Days': item.noOfDays,
        'Monthly Deduction': `₦${item.monthlyDeduction.toFixed(2)}`,
        'Salary Advance': `₦${item.salaryAdvance.toFixed(2)}`,
        'Loan': `₦${item.loan.toFixed(2)}`,
        'Account Number': item.acct_no,
        'Bank Name': item.bankname,
        'Total': `₦${item.total.toFixed(2)}`,
       
      }));
    } else if (option === 'bank') {
      // Send specific columns for bank option for each item
      formattedData = payrollData.payrollItem.map((item) => ({
        'Name': item.name,
        'Account Number': item.acct_no,
        'Total': `₦${item.total.toFixed(2)}`,
        'Bank Name': item.bankname,
      }));
    } else if (option === 'tax') {
      // Send specific columns for tax option for each item
      formattedData = payrollData.payrollItem.map((item) => ({
        'Name': item.name,
        'No Of Days': item.noOfDays,
        'Tax': `₦${item.tax.toFixed(2)}`,
        'Total': `₦${item.total.toFixed(2)}`,
      }));
    } else {
      return res.status(400).json({ error: 'Invalid option', status: false });
    }
    res.json({ data: formattedData, status: true });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// const getWallet = async (req, res, next) => {
//   try {
//     console.log(req.params);
//     const currentWallet = await WalletModel.findOne({ _id: req.params.id });

//     if (currentWallet) {
//       // Calculate Remaining amount
//       const BalanceAmount =
//         currentWallet.outstandingAmount - currentWallet.amountPaid;

//       // Create a new object with the additional calculated field
//       const responseWallet = {
//         ...currentWallet.toObject(),
//         BalanceAmount: BalanceAmount,
//       };

//       res.send({ status: true, currentWallet: responseWallet });
//     } else {
//       res.status(404).send({ message: "Wallet not found", status: false });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({ message: "Internal server error", status: false });
//   }
// };

// const addDeduuction = async (req, res, next) => {
//   try {
//     const deduction = await WalletModel.findOne({ _id: req.body._id });

//     if (!deduction) {
//       return res
//         .status(404)
//         .send({ message: "Wallet not found", status: false });
//     }

//     // Calculate new values
//     const amountPaid = deduction.amountPaid + req.body.amount;
//     const dedu_outs_amount =deduction.dedu_outs_amount - req.body.amount;

//     // Check if the money is fully paid
//     const isFullyPaid = amountPaid >= deduction.
//     outstandingAmount;

//     const deductionObj = {
//       amount: req.body.amount,
//       date: req.body.date,
//       staff: req.body.staff,
//     };

//     deduction.amountPaid = amountPaid;
//     deduction.dedu_outs_amount = dedu_outs_amount;
//     console.log(deductionObj);
//     // Add paymentObj to history array
//     deduction.history.push( deductionObj);

//     // If fully paid, update the remark
//     deduction.remark = isFullyPaid ? "Paid" : "Unpaid";

//     // Save the updated receivable
//     await  deduction.save();

//     res
//       .status(200)
//       .send({
//         status: true,
//         message: "Deduction added successfully",
        
//       });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({ message: "Internal server error", status: false });
//   }
// };

// const deleteWallet= async (req, res, next) => {
//   try {
   
//     const deletedWallet = await WalletModel.findByIdAndDelete(req.body.id);
//     if (!deletedWallet) {
//       return res.status(404).json({ message: "Account not found" });
//     }
//     res.json({ message: "Wallet deleted successfully", status:true });
//   } catch (error) {
//     next(error);
//   }

// }

module.exports = {
    createPayroll,
    fetchallpayroll,
    fetcheachpayroll  ,
    downloadpayroll
  
};
