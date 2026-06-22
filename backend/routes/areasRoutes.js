const express = require("express");

const {
  autenticarToken,
  autorizarAdmin
} = require("../middlewares/authMiddleware");

const areasController = require("../controllers/areasController");

const router = express.Router();

router.get(
  "/areas",
  autenticarToken,
  areasController.listarAreasAtivas
);

router.get(
  "/admin/areas",
  autenticarToken,
  autorizarAdmin,
  areasController.listarAreasAdmin
);

router.post(
  "/admin/areas",
  autenticarToken,
  autorizarAdmin,
  areasController.cadastrarArea
);

router.post(
  "/admin/areas/massa",
  autenticarToken,
  autorizarAdmin,
  areasController.cadastrarAreasEmMassa
);

module.exports = router;
