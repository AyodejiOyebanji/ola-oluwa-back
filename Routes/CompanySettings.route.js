const express = require('express');
const router = express.Router();
const CompanySettingsController = require('../Controllers/CompanySettingsController');

router.get('/company', CompanySettingsController.getCompanySettings);
router.put('/company', CompanySettingsController.updateCompanySettings);

module.exports = router;
