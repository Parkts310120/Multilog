const express = require("express");

const {
  autenticarToken,
  autorizarAdmin
} = require("../middlewares/authMiddleware");

const atividadesController = require("../controllers/atividadesController");

const router = express.Router();

router.post(
  "/atividades",
  autenticarToken,
  atividadesController.salvarAtividade
);

router.get(
  "/admin/atividades",
  autenticarToken,
  autorizarAdmin,
  atividadesController.listarAtividades
);

router.patch(
  "/admin/atividades/:id/ocultar",
  autenticarToken,
  autorizarAdmin,
  atividadesController.ocultarAtividade
);

router.patch(
  "/admin/atividades/ocultar-todos",
  autenticarToken,
  autorizarAdmin,
  atividadesController.ocultarTodasAtividades
);

module.exports = router;
