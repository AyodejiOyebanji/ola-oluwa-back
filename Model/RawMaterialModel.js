const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RawMaterialVoucherSchema = new Schema({
    
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

// Indexes for raw material voucher queries
RawMaterialVoucherSchema.index({ createdAt: -1 });
RawMaterialVoucherSchema.index({ cost_center_id: 1 });

const RawMaterialVoucher = mongoose.model('RawMaterialVoucher_tb', RawMaterialVoucherSchema)
module.exports = RawMaterialVoucher;
