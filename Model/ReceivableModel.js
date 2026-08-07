const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReceivablesSchema = new Schema(
  {
    customername: {
      type: String,
      required: true,
    },

    expectedAmount: {
      type: Number,
      required: true,
    },

    dedu_exp_amount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },

    remark: {
      type: String,
      required: true,
    },
    short_note: {
      type: String,
      required: true,
    },
    history: {
      type: Array,
      required: true,
    },
  
  },
  { timestamps: true }
);

// Indexes for receivables search and sort patterns
ReceivablesSchema.index({ createdAt: -1 });
ReceivablesSchema.index({ customername: 1 });
ReceivablesSchema.index({ remark: 1 }); // filter by Paid/Unpaid

const Receivable = mongoose.model("receivables_tb", ReceivablesSchema);
module.exports = Receivable;
