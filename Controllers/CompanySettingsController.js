const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');
const CompanySettings = require('../Model/CompanySettingsModel');

const getCompanySettings = async (req, res) => {
  try {
    const settings = await CompanySettings.getOrCreate();
    res.send({ status: true, settings });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to load company settings', error });
  }
};

const updateCompanySettings = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ status: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_KEY, async (err, result) => {
    if (err) {
      return res.status(401).send({ status: false, message: 'Unauthorized' });
    }

    try {
      const user = await User.findOne({ email: result.email }).exec();
      if (!user || user.role !== 'Admin') {
        return res.status(403).send({ status: false, message: 'Only admins can update company settings' });
      }

      const {
        companyName,
        shortName,
        tagline,
        address,
        phone,
        email,
        footerNote,
        motto,
        logoUrl,
        printerType,
      } = req.body;

      const settings = await CompanySettings.findByIdAndUpdate(
        'default',
        {
          $set: {
            companyName,
            shortName,
            tagline,
            address,
            phone,
            email,
            footerNote,
            motto,
            logoUrl,
            printerType,
          },
        },
        { new: true, upsert: true }
      );

      res.send({ status: true, message: 'Company settings updated successfully', settings });
    } catch (error) {
      res.status(500).send({ status: false, message: 'Failed to update company settings', error });
    }
  });
};

module.exports = { getCompanySettings, updateCompanySettings };
