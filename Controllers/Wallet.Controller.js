const WalletModel = require("../Model/WalletModel");
require("dotenv");
  const AddWallet = async (req, res, next) => {
  try {
    const Wallet = await WalletModel.create(req.body);

    res.json({ message: "Wallet added successfully", status: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation error
      return res.status(400).json({ message: error.message, status: false });
    } else if (error.name === "MongoError" && error.code === 11000) {
      // Handle duplicate key error
      return res
        .status(409)
        .json({ message: "Wallet already exists", status: false });
    } else {
      // Handle other errors
      return next(error);
    }
  }
};
const getWallets = async (req, res, next) => {
  try {
    const wallet = await WalletModel.find();
    res.json({ wallet, status: true });
  } catch (error) {
    next(error);
  }
};
const getWallet = async (req, res, next) => {
  try {
   
    const currentWallet = await WalletModel.findOne({ _id: req.params.id });

    if (currentWallet) {
      // Calculate Remaining amount
      const BalanceAmount =
        currentWallet.outstandingAmount - currentWallet.amountPaid;

      // Create a new object with the additional calculated field
      const responseWallet = {
        ...currentWallet.toObject(),
        BalanceAmount: BalanceAmount,
      };

      res.send({ status: true, currentWallet: responseWallet });
    } else {
      res.status(404).send({ message: "Wallet not found", status: false });
    }
  } catch (err) {

    res.status(500).send({ message: "Internal server error", status: false });
  }
};

const addDeduuction = async (req, res, next) => {
  try {
    const deduction = await WalletModel.findOne({ _id: req.body._id });

    if (!deduction) {
      return res
        .status(404)
        .send({ message: "Wallet not found", status: false });
    }

    // Calculate new values
    const amountPaid = deduction.amountPaid + req.body.amount;
    const dedu_outs_amount =deduction.dedu_outs_amount - req.body.amount;

    // Check if the money is fully paid
    const isFullyPaid = amountPaid >= deduction.
    outstandingAmount;

    const deductionObj = {
      amount: req.body.amount,
      date: req.body.date,
      staff: req.body.staff,
    };

    deduction.amountPaid = amountPaid;
    deduction.dedu_outs_amount = dedu_outs_amount;
   
    // Add paymentObj to history array
    deduction.history.push( deductionObj);

    // If fully paid, update the remark
    deduction.remark = isFullyPaid ? "Paid" : "Unpaid";

    // Save the updated receivable
    await  deduction.save();

    res
      .status(200)
      .send({
        status: true,
        message: "Deduction added successfully",
        
      });
  } catch (err) {

    res.status(500).send({ message: "Internal server error", status: false });
  }
};

const deleteWallet= async (req, res, next) => {
  try {
   
    const deletedWallet = await WalletModel.findByIdAndDelete(req.body.id);
    if (!deletedWallet) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Wallet deleted successfully", status:true });
  } catch (error) {
    next(error);
  }

}

module.exports = {
  AddWallet,
  getWallets,
  getWallet,
  addDeduuction,
  deleteWallet
};
