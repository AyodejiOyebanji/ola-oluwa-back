const express = require("express");
const router = express.Router();
const RawMaterialVoucherController = require("../Controllers/RawMaterialController");
router.post("/addMaterialVoucher", RawMaterialVoucherController.addVoucher);
router.get(
  "/getrawmaterialvouchers",
  RawMaterialVoucherController.getRawMaterialVouchers
);

router.get(
  "/getrawmaterialvoucher/:id",
  RawMaterialVoucherController.getRawMaterialVoucher
);
router.post(
    "/approvevouchermaterial",
    RawMaterialVoucherController.approveRawMaterialVoucher
  );
  router.get(
    "/downloadvoucher",
    RawMaterialVoucherController.downloadvoucher
  );
 

module.exports = router;
