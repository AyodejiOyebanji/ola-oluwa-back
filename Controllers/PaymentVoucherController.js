const VoucherPaymentModel = require("../Model/VoucherPaymentModel");
const PaymentModel = require("../Model/PaymentModel");
const AccountModel = require("../Model/AccountModel");
const VoucherModel = require("../Model/VoucherModel");
const RawMaterialVoucher= require("../Model/RawMaterialModel");
const addVoucherPayment = async (req, res, next) => {
    try {
      // Find account and voucher details
      const accountDetails = await AccountModel.findById(req.body.account_id);
      const voucherDetails = await VoucherModel.findById(req.body.voucher_id);
  
      // Calculate total paid including previous payments
      const totalPaidIncludingPrevious = voucherDetails.totalPaid + req.body.amountpaid;
  
      // Create voucher_payment object
      const voucher_payment = {
        voucher_id: req.body.voucher_id,
        amountPaid: req.body.amountpaid,
        approvedBy: req.body.approvedBy,
        expecttedTotalAmount: req.body.expecttedTotalAmount,
        account_id: req.body.account_id,
        remark:
          totalPaidIncludingPrevious === req.body.expecttedTotalAmount
            ? "Fully Paid"
            : "Partly paid",
        payee: req.body.payee,
      };
  
      // Save voucher_payment in VoucherPaymentModel
      const savedVoucherPayment = await VoucherPaymentModel.create(
        voucher_payment
      );
  
      // Create payment object
      const payment = {
        description: `voucher:${voucherDetails._id.toString()} ${
          voucherDetails.vouchersummary
        } ${voucherDetails.createdAt} `,
        amount: req.body.amountpaid,
        account_id: accountDetails._id,
        sender: "",
        receiver: req.body.payee,
        transaction_type: "Debit",
      };
  
      // Save payment in PaymentModel
      const savedPayment = await PaymentModel.create(payment);
  
      // Update availableamount in AccountModel
      const updatedAvailableAmount =
        accountDetails.availableamount - req.body.amountpaid;
      await AccountModel.findByIdAndUpdate(req.body.account_id, {
        availableamount: updatedAvailableAmount,
      });
  
      // Update remark and totalPaid in VoucherModel
      const updatedRemark =
        totalPaidIncludingPrevious === req.body.expecttedTotalAmount
          ? "Fully Paid"
          : "Partly paid";
      await VoucherModel.findByIdAndUpdate(req.body.voucher_id, {
        remark: updatedRemark,
        $inc: { totalPaid: req.body.amountpaid } // Increment totalPaid by amountpaid
      });
  
      res
        .status(200)
        .json({ status: true, message: "Voucher payment added successfully" });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  };
  
  
const getPaymentSOfVoucher= async (req, res, next) => {
    try {
        const voucherId = req.params.id; 
    
        // Query the database for payments with descriptions containing the voucher ID
        const payments = await PaymentModel.find({
          description: { $regex: `voucher:${voucherId}` }
        });
       
        res.json({ payments, status: true });
      } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
      }
}
const addMaterialVoucherPayment  = async (req, res, next) => {

  try {
    // Find account and voucher details
    const accountDetails = await AccountModel.findById(req.body.account_id);
    const voucherDetails = await RawMaterialVoucher.findById(req.body.voucher_id);
    
    // Calculate total paid including previous payments
    const totalPaidIncludingPrevious = voucherDetails.totalPaid + req.body.amountpaid;

    // Create voucher_payment object
    const voucher_payment = {
      voucher_id: req.body.voucher_id,
      amountPaid: req.body.amountpaid,
      approvedBy: req.body.approvedBy,
      expecttedTotalAmount: req.body.expecttedTotalAmount,
      account_id: req.body.account_id,
      remark:
        totalPaidIncludingPrevious === req.body.expecttedTotalAmount
          ? "Fully Paid"
          : "Partly paid",
      payee: req.body.payee,
    };

    // Save voucher_payment in VoucherPaymentModel
    const savedVoucherPayment = await VoucherPaymentModel.create(
      voucher_payment
    );

    // Create payment object
    const payment = {
      description: `voucher:${voucherDetails._id.toString()} ${
        voucherDetails.vouchersummary
      } ${voucherDetails.createdAt} `,
      amount: req.body.amountpaid,
      account_id: accountDetails._id,
      sender: "",
      receiver: req.body.payee,
      transaction_type: "Debit",
    };

    // Save payment in PaymentModel
    const savedPayment = await PaymentModel.create(payment);

    // Update debit in AccountModel
    const updatedDebitAmount =
      accountDetails.debit + req.body.amountpaid;

    await AccountModel.findByIdAndUpdate(req.body.account_id, {
      debit: updatedDebitAmount,
    });

    // Update availableamount in AccountModel
    const updatedAvailableAmount =
    accountDetails.availableamount - req.body.amountpaid;
  await AccountModel.findByIdAndUpdate(req.body.account_id, {
    availableamount: updatedAvailableAmount,
  });

    // Update remark and totalPaid in VoucherModel
    const updatedRemark =
      totalPaidIncludingPrevious === req.body.expecttedTotalAmount
        ? "Fully Paid"
        : "Partly paid";
    await RawMaterialVoucher.findByIdAndUpdate(req.body.voucher_id, {
      remark: updatedRemark,
      $inc: { totalPaid: req.body.amountpaid } // Increment totalPaid by amountpaid
    });

    res
      .status(200)
      .json({ status: true, message: "Voucher payment added successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }

}


module.exports = {
  addVoucherPayment,
  getPaymentSOfVoucher,
  addMaterialVoucherPayment 
};
