const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
    
    customername :{
        type: String,
        required: true
    },

    outstandingAmount: {
        type: Number,
        required: true
    },

    dedu_outs_amount: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },


    
    remark: {
        type: String,
        required: true
    },
    short_note:{
        type: String,
        required: true 
    },
    history:{
        type: Array,
        required: true 
    },

   
    
}, {timestamps: true});

// Indexes for wallet listing and remark filter
WalletSchema.index({ createdAt: -1 });
WalletSchema.index({ customername: 1 });
WalletSchema.index({ remark: 1 });

const Wallet = mongoose.model('wallet_tb', WalletSchema)
module.exports = Wallet;
