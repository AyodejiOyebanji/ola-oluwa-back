const PaymentModel = require("../Model/PaymentModel");
const AccountModel = require("../Model/AccountModel");
require("dotenv");

const fetchpaymentlogs = async (req, res, next) => {
  try {
    const paymentlogs = await PaymentModel.find().lean();

    // Batch-fetch all referenced accounts in ONE query instead of N queries
    const accountIds = [...new Set(
      paymentlogs.map(p => p.account_id).filter(id => id && id !== '')
    )];
    const accounts = accountIds.length
      ? await AccountModel.find({ _id: { $in: accountIds } }).select('_id title').lean()
      : [];
    const accountMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a]));

    const populatedPaymentLogs = paymentlogs.map(paymentlog => ({
      ...paymentlog,
      accountData: accountMap[paymentlog.account_id?.toString()] || null,
    }));

    res.json({ paymentlogs: populatedPaymentLogs, status: true });
  } catch (error) {
    next(error);
  }
};

const fetchSummaryforCreditAndDebit = async (req, res, next) => {
  try {
    // Use aggregation instead of loading all records into memory
    const summary = await PaymentModel.aggregate([
      {
        $group: {
          _id: '$transaction_type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const result = { Credit: 0, Debit: 0 };
    summary.forEach(item => { result[item._id] = item.total; });

    res.status(200).send({
      creditSummary: result['Credit'],
      debitSummary: result['Debit'],
      status: true,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Internal server error' });
  }
};

module.exports = {
  fetchpaymentlogs,
  fetchSummaryforCreditAndDebit,
};
