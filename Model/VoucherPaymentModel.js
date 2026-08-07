const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoucherPaymentSchema = new Schema({
    amountPaid: {
        type: Number,
        required: true
    },
    remark: {
        type: String,
        required: true
    },
    voucher_id:{
        type: String,
        required: true
    },
    approvedBy:{
        type: String,
        required: true
    },
    expecttedTotalAmount:{
        type: Number,
        required: true
    },
    account_id:{
        type: String,
        required: true
    },
    payee:{
        type: String,
        required: true
    }

   

   
    
}, {timestamps: true});

// Indexes for voucher payment lookups
VoucherPaymentSchema.index({ voucher_id: 1 });
VoucherPaymentSchema.index({ account_id: 1 });
VoucherPaymentSchema.index({ createdAt: -1 });

const VoucherPayment = mongoose.model('voucher_payment_tb', VoucherPaymentSchema)
module.exports = VoucherPayment;
