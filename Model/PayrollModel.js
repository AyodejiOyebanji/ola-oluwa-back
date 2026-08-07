const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PayrollSchema = new Schema({
    
    account_id: {
        type: String,
        required: true
    },
    month :{
        type: String,
        required: true
    },
    payrollItem:{
        type: Array,
        required: true 
    },
   total: {
        type: Number,
        required: true
    },
 

    
    preparedBy: {
        type: String,
        required: true
    },
    bankname: {
        type: String,
        
    },
    acct_no: {
        type: Number,
        
    },
    acct_name: {
        type: String,
        
    },
   
   
   
    
}, {timestamps: true});

// Indexes for payroll listing sorted by date, and by account
PayrollSchema.index({ createdAt: -1 });
PayrollSchema.index({ account_id: 1 });
PayrollSchema.index({ month: 1 });

const Payroll = mongoose.model('payroll_tb', PayrollSchema)
module.exports = Payroll;
