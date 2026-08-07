const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InventorySchema = new Schema({
    
    item:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    amount: {
        type: Number,

        required: true
    },

    
    date: {
        type: String,
        required: true
    },
    uploadedBy:{
        type: Number,
        required:true,  
    },
    total:{
        type: Number,
        required:true,  
    },
   
    
}, {timestamps: true});

// Indexes for search and sort patterns used in getAllInventory
InventorySchema.index({ createdAt: -1 });
InventorySchema.index({ item: 1 });

const inventory = mongoose.model('Inventory', InventorySchema)
module.exports = inventory;
