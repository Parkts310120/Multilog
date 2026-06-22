const express = require("express");

const {
  autenticarToken,
  autorizarAdmin
} = require("../middlewares/authMiddleware");

const servicosController = require("../controllers/servicosController");

const router = express.Router();

router.get(
  "/servicos",
  autenticarToken,
  servicosController.listarServicosAtivos
);

router.get(
  "/admin/servicos",
  autenticarToken,
  autorizarAdmin,
  servicosController.listarServicosAdmin
);

router.post(
  "/admin/servicos",
  autenticarToken,
  autorizarAdmin,
  servicosController.cadastrarServico
);

router.post(
  "/admin/servicos/massa",
  autenticarToken,
  autorizarAdmin,
  servicosController.cadastrarServicosEmMassa
);

module.exports = router;
