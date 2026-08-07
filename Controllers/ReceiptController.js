const Product = require('../Model/ProductModel');
const Receipt = require('../Model/ReceiptModel');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const PaymentModel = require("../Model/PaymentModel");
const AccountModel = require("../Model/AccountModel");
const ProductHistory = require('../Model/ProductHistory');
require('dotenv');
const JWT_KEY = process.env.JWT_KEY
const ExcelJS = require('exceljs');
const AddReceipt = async (req, res) => {
  try {
    // Destructure the request body
    const { nameOfCustomer, address, date, items, totalAmount, day, accountPaidInto_id } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !day) {
      return res.status(400).send({ status: false, message: 'Invalid or missing required fields in the request body' });
    }

    // Fetch the current day
    const today = new Date().toISOString().split('T')[0];

    // Loop through the items and update ProductHistory for each sold product
    await Promise.all(
      items.map(async (item) => {
        // ... (rest of the existing code for updating ProductHistory)
      })
    );

    // Update product quantities
    await Promise.all(
      items.map(async (item) => {
        const { productId, productQuantity } = item;
        await Product.findByIdAndUpdate(productId, {
          $inc: { productQuantity: -productQuantity },
        });
      })
    );

    // Get the last receipt to determine the next serial number
    const lastReceipt = await Receipt.findOne().sort({ createdAt: -1 });

    // Extract the serial number from the last receipt's receiptId
    let serialNumber = 1;
    if (lastReceipt && lastReceipt.receiptId) {
      const lastSerialNumber = parseInt(lastReceipt.receiptId.slice(-4), 10);
      serialNumber = isNaN(lastSerialNumber) ? 1 : lastSerialNumber + 1;
    }

    // Pad the serial number to have at least 4 digits
    const paddedSerialNumber = serialNumber.toString().padStart(4, '0');

    // Concatenate the current year and the padded serial number to form the new receiptId
    const currentYear = new Date().getFullYear();
    const receiptId = `${currentYear}${paddedSerialNumber}`;

    // Find the account using accountPaidInto_id and update the balance
    if (accountPaidInto_id) { // Check if accountPaidInto_id is provided
      const account = await AccountModel.findById(accountPaidInto_id);
      if (account) {
        account.availableamount += parseFloat(totalAmount); // Assuming 'availableamount' is a numeric field
        await account.save();
      }

      // Create payment entry
      const payment = {
        description: `receipt:${receiptId} day: ${day}`,
        amount: parseFloat(totalAmount), // Assuming 'amount' is a numeric field
        account_id: accountPaidInto_id,
        sender: nameOfCustomer,
        receiver: "Company",
        transaction_type: "Credit",
      };

      await PaymentModel.create(payment);
    }

    // Save receipt data
    const receiptData = {
      nameOfCustomer,
      address,
      date,
      items,
      receiptId,
      totalAmount,
      day,
      accountPaidInto_id,
    };
    const receipt = new Receipt(receiptData);
    const savedReceipt = await receipt.save();

    res.status(200).send({ savedReceipt, status: true });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Internal server error' });
  }
};




  const getReceipt = async (req, res) => {
    try {
      
      const currentReceipt = await Receipt.findOne({ _id: req.params.receiptId });
  
      if (currentReceipt) {
        res.send({ status: true, currentReceipt });
      } else {
        res.status(404).send({ message: 'Receipt not found', status: false });
      }
    } catch (err) {

      res.status(500).send({ message: 'Internal server error', status: false });
    }
  }
 





  const getTodaySale =async (req,res)=>{



    try{
        const dayReceipt = await Receipt.find({ day: req.body.date });
        if (dayReceipt) {
            res.send({ status: true, dayReceipt });
          } else {
            res.status(404).send({ message: 'Receipt not found', status: false });
          }
        } catch (err) {
        
          res.status(500).send({ message: 'Internal server error', status: false });
        }}
    
        const getAllReceipt = async (req, res) => {
          try {
            const { page = 1, pageSize = 20, search } = req.query;
            let query = {};
        
            if (search) {
              const isDateFormat = /^(\d{2}\/\d{2}\/\d{4})$/.test(search);
        
              if (isDateFormat) {
                query = { day: search };
              } else {
                const searchTerms = search.split(' ');
                const regexPattern = new RegExp(searchTerms.join('|'), 'i');

                // Only search String fields with regex — MongoDB throws a cast error
                // if you apply $regex to a Number field (e.g. totalAmount)
                const orConditions = [
                  { day: { $regex: regexPattern } },
                  { nameOfCustomer: { $regex: regexPattern } },
                  { receiptId: { $regex: regexPattern } },
                ];

                // Add totalAmount only when the search term is a valid number
                const numericValue = parseFloat(search);
                if (!isNaN(numericValue)) {
                  orConditions.push({ totalAmount: numericValue });
                }

                query = { $or: orConditions };
              }
            }
        
            const receipts = await Receipt.find(query)
              .sort({ createdAt: -1 })
              .skip((page - 1) * pageSize)
              .limit(pageSize)
              .lean();  // return plain objects — faster than Mongoose documents

            // Batch-fetch all referenced accounts in ONE query instead of N queries
            const accountIds = [...new Set(
              receipts.map(r => r.accountPaidInto_id).filter(id => id && id !== '')
            )];
            const accounts = accountIds.length
              ? await AccountModel.find({ _id: { $in: accountIds } }).select('_id title').lean()
              : [];
            const accountMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a.title]));

            const totalReceipts = await Receipt.countDocuments(query);
            const totalPages = Math.ceil(totalReceipts / pageSize);
            const hasNextPage = page < totalPages;
        
            const formattedReceipts = receipts.map((receipt) => ({
              _id: receipt._id,
              nameOfCustomer: receipt.nameOfCustomer,
              address: receipt.address,
              date: receipt.date,
              items: receipt.items,
              receiptId: receipt.receiptId,
              totalAmount: receipt.totalAmount,
              day: receipt.day,
              accountPaidInto: receipt.accountPaidInto_id
                ? (accountMap[receipt.accountPaidInto_id.toString()] || 'Unknown Account')
                : 'Unknown Account',
              createdAt: receipt.createdAt,
              updatedAt: receipt.updatedAt,
            }));
        
            res.json({
              receipts: formattedReceipts,
              status: true,
              hasNextPage,
            });
          } catch (error) {
            res.json({ status: false, message: error.message });
          }
        };
        
        
        const getTodaystats = async (req, res, next) => {
          try {
         
            const filterDate = req.body.date ? new Date(req.body.date) : new Date();
            const startOfDay = new Date(filterDate.toISOString().split('T')[0]); // Start of the day
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1); // End of the day
        
            const dayReceipts = await Receipt.find({
              createdAt: { $gte: startOfDay, $lt: endOfDay },
            });
        
            if (dayReceipts && dayReceipts.length > 0) {
              const summary = dayReceipts.reduce((acc, receipt) => {
                receipt.items.forEach(item => {
                  const productName = item.productName;
                  const productQuantity = Number(item.productQuantity);
                  const transactionDate = receipt.createdAt; // Use createdAt for date of the transaction
        
                  const existingSummaryItem = acc.find(
                    summaryItem => summaryItem.productName === productName
                  );
        
                  if (existingSummaryItem) {
                    existingSummaryItem.productQuantity += productQuantity;
                  } else {
                    acc.push({
                      productName,
                      productQuantity,
                      transactionDate,
                    });
                  }
                });
                return acc;
              }, []);
        
              res.send({ status: true, summary });
              
            } else {
              res.send({ status: true, summary: [] }); 
            }
          } catch (err) {
            res.status(500).send({ message: 'Internal server error', status: false });
          }
        };
        
        
    

  const getdeleteReceipt= async (req, res, next) => {
    const deleteId = req.body.deleteId;
    
    try {
      const result = await Receipt.deleteOne({ _id: deleteId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Receipt not found' });
      }
      res.json({ message: 'Receipt deleted successfully', status:true });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  const formatDateForDatabase = (date) => {
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
  };
  
  const downloadSales = async (req, res, next) => {
    try {
      const { start_date, end_date } = req.query;
  
      // Convert start_date and end_date to JavaScript Date objects
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
  
    
  
      // Fetch and select only specific fields based on the 'createdAt' field
      const receipts = await Receipt.find({
        createdAt: {
          $gte: startDate,
          $lt: endDate.setDate(endDate.getDate() + 1), // Adjust end date to include entire day
        },
      })
        .select('nameOfCustomer totalAmount createdAt receiptId')
        .exec();
  
  
      if (receipts.length === 0) {
        // If there are no receipts, create an empty data row with a message
        const emptyRow = {
          Customer: 'No data available for the specified date range',
          Amount: '',
          Day: '',
          Receipt_ID: '',
        };
  
        res.json({ receipts: [emptyRow], totalAmount: 0, status: true });
        return;
      }
  
      // Calculate the total amount
      const totalAmount = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.totalAmount), 0);
  
      // Map the data to rename the fields
      const formattedReceipts = receipts.map((receipt) => ({
        Customer: receipt.nameOfCustomer,
        Amount: `₦${receipt.totalAmount}:00`,
        Day: receipt.createdAt.toISOString().split('T')[0],
        Receipt_ID: receipt.receiptId,
      }));
  
      res.json({ receipts: formattedReceipts, totalAmount, status: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  
  
  
  
  
  const fetchTheLastSevenReceipts = async (req, res, next) => {
    try {
      // Fetch the last seven receipts, sorted by createdAt in descending order
      const lastSevenReceipts = await Receipt.find()
        .sort({ createdAt: -1 })
        .limit(7)
        .lean();  // plain objects — faster than Mongoose documents
  
      // Batch-fetch all referenced accounts in ONE query
      const accountIds = [...new Set(
        lastSevenReceipts.map(r => r.accountPaidInto_id).filter(id => id && id !== '')
      )];
      const accounts = accountIds.length
        ? await AccountModel.find({ _id: { $in: accountIds } }).select('_id title').lean()
        : [];
      const accountMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a.title]));
  
      const formattedReceipts = lastSevenReceipts.map((receipt) => ({
        _id: receipt._id,
        nameOfCustomer: receipt.nameOfCustomer,
        address: receipt.address,
        date: receipt.date,
        items: receipt.items,
        receiptId: receipt.receiptId,
        totalAmount: receipt.totalAmount,
        day: receipt.day,
        accountPaidInto: receipt.accountPaidInto_id
          ? (accountMap[receipt.accountPaidInto_id.toString()] || 'Unknown Account')
          : 'Unknown Account',
        createdAt: receipt.createdAt,
        updatedAt: receipt.updatedAt,
      }));
  
      res.status(200).send({ receipts: formattedReceipts, status: true });
    } catch (error) {
      res.status(500).send({ status: false, message: 'Internal server error' });
    }
  };
  
  

  const calculateCumulativeRevenueForEachMonth = async (req, res, next) => {
    try {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }); // Get the current month name
  
      const cumulativeRevenueForCurrentMonth = await Receipt.aggregate([
        {
          $match: {
            'createdAt': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) },
          },
        },
        {
          $group: {
            _id: null,
            cumulativeRevenue: { $sum: { $toDouble: '$totalAmount' } },
          },
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            cumulativeRevenue: 1,
          },
        },
      ]);
  
      res.status(200).send({ cumulativeRevenueForCurrentMonth, currentMonth, status: true });
    } catch (error) {
      res.status(500).send({ status: false, message: 'Internal server error' });
    }
  };
  
  
  const  getSearchedReceipt = async (req, res) => {
    try {
      const searchedReceiptId = req.params.receiptId.toString(); // Convert to string
  
      // Assuming 'Receipt' is the model for your receipts
      const searchedReceipt = await Receipt.findOne({ receiptId: searchedReceiptId });
  
      if (searchedReceipt) {
        // Send the data to the frontend
        res.status(200).send({ status: true, searchedReceipt });
      } else {
        res.status(404).send({ message: 'Receipt not found', status: false });
      }
    } catch (error) {
      res.status(500).send({ message: 'Internal server error', status: false });
    }
  }

  const addPaymentForExistingReceipt = async (req, res) => {
    try {
      const { selectedaccount_id, amount, nameOfCustomer, receiptId } = req.body;
  
      // Validate required fields
      if (!selectedaccount_id || !amount || !nameOfCustomer || !receiptId) {
        return res.status(400).send({ status: false, message: 'Invalid or missing required fields in the request body' });
      }
  
      // Find the account using selectedaccount_id and update the balance
      const account = await AccountModel.findById(selectedaccount_id);
      if (account) {
        account.availableamount += parseFloat(amount); // Assuming 'availableamount' is a numeric field
        await account.save();
      }
  
      // Create payment entry with current date in the description
      const currentDate = new Date();
      const payment = {
        description: `receipt:${receiptId} date:${currentDate.toISOString()}`,
        amount: parseFloat(amount), // Assuming 'amount' is a numeric field
        account_id: selectedaccount_id,
        sender: nameOfCustomer,
        receiver: "Company",
        transaction_type: "Credit",
      };
  
      await PaymentModel.create(payment);
  
    
      const updatedReceipt = await Receipt.findOneAndUpdate(
        { receiptId: receiptId },
        {
          accountPaidInto_id: selectedaccount_id,
          date: currentDate,
        },
        { new: true }
      );
  
      res.status(200).send({ status: true, message: 'Payment added successfully' });
    } catch (error) {
      res.status(500).send({ status: false, message: 'Internal server error' });
    }
  };
  
  const updateReciptDate= async (req, res) => {
   try {
      // Extract the formatted date and the edited receipt ID from the request body
      const { day, _id } = req.body;
  
      // Find the receipt by ID and update the 'day' field
      const updatedReceipt = await Receipt.findByIdAndUpdate(
        _id,        // Search by the provided receipt ID
        { day },    // Update the 'day' field with the new date
        { new: true } // Return the updated document (not the original)
      );
  
      // If no receipt is found with the provided ID
      if (!updatedReceipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
  
      // Respond with the updated receipt document
      return res.status(200).json({message: "Receipt updated"});
    } catch (error) {
      // Handle any errors
      return res.status(500).json({ message: "Server error", error });
    }
  }
  
  const  getRangeSales= async (req, res) => {
    try {
      const { start_date, end_date } = req.body;
  
      if (!start_date || !end_date) {
        return res.status(400).json({ message: 'Start date and end date are required.' });
      }
  
      // Convert frontend date format (YYYY-MM-DD) to comparable Date objects
      const startDate = new Date(new Date(start_date).toISOString().split('T')[0]); // Start of the range
      const endDate = new Date(new Date(end_date).toISOString().split('T')[0]); // End of the range
      endDate.setDate(endDate.getDate() + 1); // Include the last day in the range
  
      // Fetch receipts within the date range using createdAt field
      const rangeReceipts = await Receipt.find({
        createdAt: { $gte: startDate, $lt: endDate },
      });
  
      if (rangeReceipts && rangeReceipts.length > 0) {
        const summary = rangeReceipts.reduce((acc, receipt) => {
          receipt.items.forEach((item) => {
            const productName = item.productName;
            const productQuantity = Number(item.productQuantity);
            const transactionDate = receipt.createdAt; // Use createdAt for date of the transaction
  
            const existingSummaryItem = acc.find(
              (summaryItem) => summaryItem.productName === productName
            );
  
            if (existingSummaryItem) {
              existingSummaryItem.productQuantity += productQuantity;
            } else {
              acc.push({
                productName,
                productQuantity,
                transactionDate,
              });
            }
          });
          return acc;
        }, []);
  
        res.status(200).send({ status: true, summary });
      } else {
        res.status(200).send({ status: true, summary: [] });
      }
    } catch (err) {
      res.status(500).send({ message: 'Internal server error', status: false });
    }
  };
  

module.exports = {
    AddReceipt,
    getReceipt,
    getTodaySale,
    getAllReceipt,
    getdeleteReceipt,
    getTodaystats,
    downloadSales,
    fetchTheLastSevenReceipts ,
    calculateCumulativeRevenueForEachMonth,
    getSearchedReceipt ,
    addPaymentForExistingReceipt,
    updateReciptDate,
    getRangeSales
  
}
