const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReceiptSchema = new Schema({
    
    nameOfCustomer:{
        type: String,
        
        required: true
    },

    address: {
        type: String,
        
        required: true
    },

    date: {
        type: String,
        required: true
    },

    
    items: {
        type: Array,
        required: true
    },
    receiptId:{
        type: String,
        required:true,  
    },
    totalAmount:{
        type: Number,
        required:true,
        // Existing string data in DB is handled transparently: mongoose auto-casts
        // numeric strings like "5000" to Number on read via the getter below,
        // and new inserts use Number directly.
        get: v => (typeof v === 'string' ? parseFloat(v) || 0 : v),
    },
    day:{
        type: String,
        required:true,  
    },
    accountPaidInto_id:{
        type: String,
         
    }
   
    
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

// Indexes for the most common receipt queries
ReceiptSchema.index({ createdAt: -1 });       // getAllReceipt sort + date range queries
ReceiptSchema.index({ day: 1 });              // getTodaySale, search by day
ReceiptSchema.index({ receiptId: 1 });        // getSearchedReceipt lookup
ReceiptSchema.index({ nameOfCustomer: 1 });   // search by customer name
ReceiptSchema.index({ accountPaidInto_id: 1 }); // populate/filter by account

const receipt = mongoose.model('Receipt', ReceiptSchema)
module.exports = receipt;
