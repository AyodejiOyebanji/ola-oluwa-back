const mongoose = require('mongoose');
const { Schema } = mongoose;

const DEFAULT_SETTINGS = {
  companyName: 'SMATO MANUFACTURING LIMITED',
  shortName: 'Smato',
  tagline: 'Manufacturing Ltd',
  address: 'Plot 1-6 Abudaka,Gambari, Ogbomoso',
  phone: '08081303202, 08167626228',
  email: 'Smatomanufacturing@yahoo.com',
  footerNote:
    'Customers are advised to cross check their goods properly before leaving. No refund of money after payment. Thanks.',
  motto: 'JESUS IS THE LORD',
  logoUrl: '../../assets/smatologo-removebg-preview.png',
  printerType: 'normal', // 'normal' for A4/Letter printer, 'thermal' for POS/receipt printer
};

const CompanySettingsSchema = new Schema(
  {
    _id: { type: String, default: 'default' },
    companyName: { type: String, default: DEFAULT_SETTINGS.companyName },
    shortName: { type: String, default: DEFAULT_SETTINGS.shortName },
    tagline: { type: String, default: DEFAULT_SETTINGS.tagline },
    address: { type: String, default: DEFAULT_SETTINGS.address },
    phone: { type: String, default: DEFAULT_SETTINGS.phone },
    email: { type: String, default: DEFAULT_SETTINGS.email },
    footerNote: { type: String, default: DEFAULT_SETTINGS.footerNote },
    motto: { type: String, default: DEFAULT_SETTINGS.motto },
    logoUrl: { type: String, default: DEFAULT_SETTINGS.logoUrl },
    printerType: { type: String, default: DEFAULT_SETTINGS.printerType, enum: ['normal', 'thermal'] },
  },
  { timestamps: true }
);

CompanySettingsSchema.statics.getOrCreate = async function () {
  let settings = await this.findById('default');
  if (!settings) {
    settings = await this.create({ _id: 'default', ...DEFAULT_SETTINGS });
  }
  return settings;
};

module.exports = mongoose.model('CompanySettings', CompanySettingsSchema);
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
