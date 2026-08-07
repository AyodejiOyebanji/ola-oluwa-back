const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    
    title:{
        type: String,
        required: true
    },

    description : {
        type: String,
        required: true
    },

    acct_no: {
        type: Number,
        required: true
    },

    
    availableamount: {
        type: Number,
        required: true
    },
    act_type:{
        type: String,
        required: true 
    },
    debit:{
        type: Number,
        required: true
    }
   
    
}, {timestamps: true});

// Indexes for account type filtering (most common query pattern)
AccountSchema.index({ act_type: 1 });
AccountSchema.index({ title: 1 });

const Account = mongoose.model('account_tb', AccountSchema)
module.exports = Account;
