const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    transaction_type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    account_id:{
        type: String,
        required: true,
        ref: 'AccountModel' 
    },
    
    sender:{
        type: String,
        
    },
    amount:{
        type: Number,
        required: true
    },
    receiver:{
        type: String,
       
    }
   

   

   
    
}, {timestamps: true});

// Indexes for account statement queries (filter by account_id, sort by date)
PaymentSchema.index({ account_id: 1, createdAt: -1 });
PaymentSchema.index({ transaction_type: 1 });

const payment = mongoose.model('payment_tb', PaymentSchema)
module.exports = payment;
