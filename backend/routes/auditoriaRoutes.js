const express = require("express");

const {
  autenticarToken,
  autorizarAdmin
} = require("../middlewares/authMiddleware");

const auditoriaController = require("../controllers/auditoriaController");

const router = express.Router();

router.get(
  "/admin/auditoria",
  autenticarToken,
  autorizarAdmin,
  auditoriaController.listarLogs
);

module.exports = router;
