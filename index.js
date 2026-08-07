require('dotenv').config();
require('./config');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const AuthRoute = require('./Routes/Auth.route');
const UserRoute = require('./Routes/User.route');
const ProductRoute = require('./Routes/Product.route');
const ReceiptRoute = require('./Routes/ReceiptRoute');
const HistoryRoute = require('./Routes/History.route');
const InventoryRoute = require('./Routes/Inventory.route');
const AccountRoute = require('./Routes/Account.route');
const AccounttypeRoute = require('./Routes/Acttype.route');
const ReceivableRoute = require('./Routes/Receivable.route');
const WalletRoute = require('./Routes/Wallet.route');
const VoucherRoute = require('./Routes/Voucher.route');
const VoucherPaymentRoute = require('./Routes/PaymentVoucher.route');
const PayrollRoute = require('./Routes/Payroll.route');
const RawMaterialVoucherRoute = require('./Routes/RawMaterialVoucher.route');
const PaymentlogsRoute = require('./Routes/Paymentlogs.route');
const CompanySettingsRoute = require('./Routes/CompanySettings.route');

const app = express();
const bodyParser = require('body-parser');
const http = require('http');

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.set("*","cors")
  
  

app.get('/', (_, res) => {
    res.json({ message: 'Smato is working' });
  });

app.use('/api', AuthRoute);
app.use('/api/user',UserRoute);
app.use('/api/product',ProductRoute);
app.use('/api/receipt',ReceiptRoute);
app.use('/api/history',HistoryRoute);
app.use('/api/inventory',InventoryRoute);
app.use('/api/account',AccountRoute);
app.use('/api/account_type',AccounttypeRoute);
app.use('/api/receivables',ReceivableRoute );
app.use('/api/wallet',WalletRoute );
app.use('/api/voucher',VoucherRoute );
app.use('/api/voucherpayment',VoucherPaymentRoute);
app.use('/api/payroll',PayrollRoute);
app.use('/api/rawmaterialvoucher',RawMaterialVoucherRoute);
app.use('/api/paymentlogs',PaymentlogsRoute);
app.use('/api/settings',CompanySettingsRoute);


const server = http.createServer(app);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {console.log(`App listening on port ${PORT}`)});

