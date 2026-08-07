const RawMaterialVoucherModel = require("../Model/RawMaterialModel");
require("dotenv");
const addVoucher = async (req, res, next) => {
   
    try {
     
      const { cost_center_id, staff, date, vouchersummary, paymentdetails, voucheritem, total, remark,totalPaid } = req.body;
  
      // Create a new instance of the Voucher model
      const newVoucher = new RawMaterialVoucherModel({
        cost_center_id,
        Staff: staff,
        date,
        vouchersummary,
        paymentdetails,
        voucheritem,
        total,
         remark,
         totalPaid
      });
  
      
      const savedVoucher = await newVoucher.save();
  
      res.status(201).json({ status: true, message: 'Voucher added successfully', voucher: savedVoucher });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Internal server error' });
    }
  };
  
const getRawMaterialVouchers= async (req, res, next) => {
    try {
        const vouchers = await RawMaterialVoucherModel.find().populate({
          path: 'cost_center_id',
          model: 'account_tb', 
          select: '_id title description acct_no, '
        });
    
        res.json({ vouchers, status: true });
      } catch (error) {
    
        next(error);
      }
};

const getRawMaterialVoucher= async (req, res, next) => {
    try {
      const voucherId = req.params.id;
      const voucher = await RawMaterialVoucherModel.findById(voucherId).populate({
        path: 'cost_center_id',
        model: 'account_tb',
        select: '_id title description acct_no',
      });
  
      if (!voucher) {
        return res.status(404).json({ status: false, message: 'Voucher not found' });
      }
  
      res.json({ voucher, status: true });
    } catch (error) {
      
      next(error);
    }
  };
  const approveRawMaterialVoucher = async (req, res, next) => {
   
    try {
      const { id, remark } = req.body;
  
      // Use findByIdAndUpdate to find the voucher by ID and update the remark
      const updatedVoucher = await RawMaterialVoucherModel.findByIdAndUpdate(
        id,
        { remark: remark },
        { new: true } // Return the updated document
      );
  
      if (!updatedVoucher) {
        return res.status(404).json({ status: false, message: 'Voucher not found' });
      }
  
      res.json({ message: 'Voucher Approved', status: true });
    } catch (error) {
  
      next(error);
    }
  };
  const   downloadvoucher = async (req, res, next) => {
  
    try {
      const { start_date, end_date } = req.query;
  
      // Convert start_date and end_date to JavaScript Date objects
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
  
    
  
      // Fetch and select only specific fields based on the 'createdAt' field
      const vouchers = await RawMaterialVoucherModel.find({
        createdAt: {
          $gte: startDate,
          $lt: endDate.setDate(endDate.getDate() + 1), // Adjust end date to include entire day
        },
      })
        .select('vouchersummary paymentdetails total Staff remark  createdAt')
        .exec();
  
    
  
      if (vouchers.length === 0) {
        // If there are no receipts, create an empty data row with a message
        const emptyRow = {
          vouchersummary: 'No data available for the specified date range',
          PaymentDetails: '',
        Date: '',
        Total: '',
        Staff: '',
        Remark:'',
          
        };
  
        res.json({ vouchers: [emptyRow], totalAmount: 0, status: true });
        return;
      }
  
   
      // Map the data to rename the fields
      const formattedVoucher = vouchers.map((voucher) => ({
        VoucherSummary: voucher.vouchersummary,
        PaymentDetails: voucher.paymentdetails,
        Date: voucher.createdAt.toISOString().split('T')[0],
        Total: `₦${voucher.total}:00`,
        Staff: voucher.Staff,
        Remark: voucher.remark,


      }));
  
      res.json({ voucher: formattedVoucher,  status: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

module.exports = {
    addVoucher,
    getRawMaterialVouchers,
    getRawMaterialVoucher,
    approveRawMaterialVoucher,
    downloadvoucher
    // approveVoucher
};
