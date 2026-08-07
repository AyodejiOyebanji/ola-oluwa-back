const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoucherSchema = new Schema({
    
    cost_center_id :{
        type: String,
        required: true
    },

    Staff: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },
    vouchersummary: {
        type: String,
        required: true
    },
    paymentdetails: {
        type: String,
        required: true
    },
    total:{
        type: Number,
        required: true 
    },
    voucheritem:{
        type: Array,
        required: true 
    },
    remark:{
        type: String,
        required: true
    },
    totalPaid:{
        type: Number,
        required:true
    }
   
    
}, {timestamps: true});

// Indexes for voucher listing and cost center filtering
VoucherSchema.index({ createdAt: -1 });
VoucherSchema.index({ cost_center_id: 1 });
VoucherSchema.index({ remark: 1 });

const Voucher = mongoose.model('Voucher_tb', VoucherSchema)
module.exports = Voucher;
