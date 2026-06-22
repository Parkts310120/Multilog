const express = require("express");

const {
  autenticarToken,
  autorizarAdmin
} = require("../middlewares/authMiddleware");

const usuariosController = require("../controllers/usuariosController");

const router = express.Router();

router.get(
  "/admin/usuarios",
  autenticarToken,
  autorizarAdmin,
  usuariosController.listarUsuarios
);

router.post(
  "/admin/usuarios",
  autenticarToken,
  autorizarAdmin,
  usuariosController.cadastrarAdmin
);

router.post(
  "/admin/executantes",
  autenticarToken,
  autorizarAdmin,
  usuariosController.cadastrarExecutante
);

router.post(
  "/admin/executantes/massa",
  autenticarToken,
  autorizarAdmin,
  usuariosController.cadastrarExecutantesEmMassa
);

module.exports = router;
