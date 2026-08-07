const History = require('../Model/HistoryModel');
const ProductHistory = require('../Model/ProductHistory');
require('dotenv');



const addHistory = async(req,res,next)=>{
      

    
        try {
          const history = await History.create(req.body);
        
          res.json({ status: true });
        } catch (error) {
          if (error.name === 'ValidationError') {
            // Handle validation error
            return res.status(400).json({ message: error.message, status: false });
          } else if (error.name === 'MongoError' && error.code === 11000) {
            // Handle duplicate key error
            return res.status(409).json({ status: false });
          } else {
            // Handle other errors
            return next(error);
          }
        }
      
      
}

const getAllHistory= async(req,res,next)=>{
    

    try {
        const history = await History.find();
      
        res.json({ history, status:true});
       
      } catch (error) {
        next(error);
      }
     
}
const fetchProductHistory = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc', search } = req.query;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    let query = {};

    if (search) {
      const searchTerms = search.split(' ');

      query = {
        $or: searchTerms.map((term) => {
          const numericValue = Number(term);

          if (!isNaN(numericValue)) {
            return {
              $or: [
                { productInitialQuantity: { $gte: numericValue } },
                { productAdded: { $gte: numericValue } },
                { totalRemaining: { $gte: numericValue } },
              ],
            };
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
            // Search for a date range on the createdAt field (for the entire day)
            const startDate = new Date(term);
            startDate.setUTCHours(0, 0, 0, 0);

            const endDate = new Date(term);
            endDate.setUTCHours(23, 59, 59, 999);

            return { createdAt: { $gte: startDate, $lte: endDate } };
          } else {
            return { productName: { $regex: term, $options: 'i' } };
          }
        }),
      };
    }

    const history = await ProductHistory.find(query)
      .sort({ [sortBy]: sortDirection }) // Sort by the specified field and direction
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const totalHistory = await ProductHistory.countDocuments(query);
    const totalPages = Math.ceil(totalHistory / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      history,
      status: true,
      hasNextPage,
      hasPrevPage,
    });
  } catch (error) {
    next(error);
  }
};






  module.exports = {
    addHistory,
    getAllHistory,
    fetchProductHistory
}
