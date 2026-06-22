const express = require("express");

const {
  autenticarToken,
  autorizarAdmin
} = require("../middlewares/authMiddleware");

const depositantesController = require("../controllers/depositantesController");

const router = express.Router();

router.get(
  "/depositantes",
  autenticarToken,
  depositantesController.listarDepositantesAtivos
);

router.get(
  "/admin/depositantes",
  autenticarToken,
  autorizarAdmin,
  depositantesController.listarDepositantesAdmin
);

router.post(
  "/admin/depositantes",
  autenticarToken,
  autorizarAdmin,
  depositantesController.cadastrarDepositante
);

router.post(
  "/admin/depositantes/massa",
  autenticarToken,
  autorizarAdmin,
  depositantesController.cadastrarDepositantesEmMassa
);

module.exports = router;
