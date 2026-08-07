
const ReceivableModel= require('../Model/ReceivableModel');
require('dotenv');
const PaymentModel = require("../Model/PaymentModel");
const AccountModel = require("../Model/AccountModel");
const AddReceivable = async (req, res, next) => {
  
    try {
        const Receivable= await ReceivableModel.create(req.body);
      
        res.json({ message: "Receivable added successfully", status: true });
      } catch (error) {
        if (error.name === 'ValidationError') {
          // Handle validation error
          return res.status(400).json({ message: error.message, status: false });
        } else if (error.name === 'MongoError' && error.code === 11000) {
          // Handle duplicate key error
          return res.status(409).json({ message: 'Receivable already exists', status: false });
        } else {
          // Handle other errors
        
          return next(error);
        }
      }

}


const getReceivables = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, search } = req.query;
    let query = {};

    if (search) {
      const searchTerms = search.split(' ');

      query = {
        $or: searchTerms.map((term) => {
          if (!isNaN(term)) {
            return {
              $or: [
                { expectedAmount: { $eq: Number(term) } },
                { dedu_exp_amount: { $eq: Number(term) } },
                { amountPaid: { $eq: Number(term) } },
              ],
            };
          } else {
            return {
              $or: [
                { customername: { $regex: term, $options: 'i' } },
                { remark: { $regex: term, $options: 'i' } },
                { short_note: { $regex: term, $options: 'i' } },
              ],
            };
          }
        }),
      };
    }

    const receivables = await ReceivableModel.find(query)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (most recent first)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const totalReceivables = await ReceivableModel.countDocuments(query);
    const totalPages = Math.ceil(totalReceivables / pageSize);
    const hasNextPage = page < totalPages;

    res.json({
      receivables,
      status: true,
      hasNextPage,
    });
  } catch (error) {
    next(error);
  }
};

const getReceivable = async (req, res, next) => {
  try {
    const currentReceivable = await ReceivableModel.findOne({ _id: req.params.id });

    if (currentReceivable) {
      // Calculate outstanding amount
      const outstandingAmount = currentReceivable.expectedAmount - currentReceivable.amountPaid;

      // Create a new object with the additional calculated field
      const responseReceivable = {
        ...currentReceivable.toObject(),
        outstandingAmount: outstandingAmount
      };

      res.send({ status: true, currentReceivable: responseReceivable });
    } else {
      res.status(404).send({ message: 'Receivable not found', status: false });
    }
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', status: false });
  }
};

const addPayment = async (req, res, next) => {
  try {
    const receivable = await ReceivableModel.findOne({ _id: req.body._id });
    
    if (!receivable) {
      return res.status(404).send({ message: 'Receivable not found', status: false });
    }

    const account = await AccountModel.findOne({ _id: req.body.account_used_id });
    if (!account) {
      return res.status(404).send({ message: 'Account not found', status: false });
    }

    // Calculate new values
    const amountPaid = receivable.amountPaid + req.body.amount;
    const dedu_exp_amount = receivable.dedu_exp_amount - req.body.amount;

    // Check if the money is fully paid
    const isFullyPaid = amountPaid >= receivable.expectedAmount;

    // Update Receivable model
    receivable.amountPaid = amountPaid;
    receivable.dedu_exp_amount = dedu_exp_amount;

    // Add paymentObj to history array
    const paymentObj = {
      amount: req.body.amount,
      date: req.body.date,
      staff: req.body.staff,
    };
    receivable.history.push(paymentObj);

    // If fully paid, update the remark
    receivable.remark = isFullyPaid ? 'Paid' : 'Unpaid';

    // Save the updated receivable
    await receivable.save();

    // Update Account model
    account.availableamount += req.body.amount;
    await account.save();

    // Create payment object for Payment model
    const paymentData = {
      transaction_type: "Credit",
      description: `receivable:${req.body._id} ${req.body.date}`,
      account_id: req.body.account_used_id,
      sender: '',
      amount: req.body.amount,
      receiver: req.body.staff,
    };

    // Save payment data to Payment model
    // const payment = new PaymentModel(paymentData);
    // await payment.save();

    res.status(200).send({ status: true, message: 'Payment added successfully', receivable: receivable });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', status: false });
  
  }
};

const deleteReceivables= async (req, res, next) => {
  try {
    
    const deletedAccount = await ReceivableModel.findByIdAndDelete(req.body.id);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Receivable deleted successfully", status:true });
  } catch (error) {
    next(error);
  }

}

const gettotalreceivables= async (req, res, next) => {
  try {
    const totalDeduExpAmount = await ReceivableModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$dedu_exp_amount' },
        },
      },
    ]);

    // Extract the totalDeduExpAmount from the result or default to 0
    const totalAmount = totalDeduExpAmount.length > 0 ? totalDeduExpAmount[0].total : 0;

    res.json({
      totalAmount,
      status: true,
    });
  } catch (error) {
    next(error);
  }
}




module.exports = {
    AddReceivable,
    getReceivables,
    getReceivable,
    addPayment,
    deleteReceivables,
    gettotalreceivables
  
}
