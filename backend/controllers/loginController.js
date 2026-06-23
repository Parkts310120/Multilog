const loginService = require("../services/loginService");
const { validarLogin } = require("../validators/loginValidator");
const auditoriaService = require("../services/auditoriaService");

async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    validarLogin({ usuario, senha });

    const usuarioAutenticado = await loginService.autenticarUsuario(usuario, senha);

    await auditoriaService.registrarLog({
    usuario: usuarioAutenticado.usuario,
    acao: "LOGIN",
    tabela: "usuarios_sistema",
    registro_id: String(usuarioAutenticado.id),
    depois: {
        nome: usuarioAutenticado.nome,
        tipo: usuarioAutenticado.tipo
    }
    });

    const token = loginService.gerarToken(usuarioAutenticado);

    return res.json({
      sucesso: true,
      token,
      usuario: {
        id: usuarioAutenticado.id,
        nome: usuarioAutenticado.nome,
        usuario: usuarioAutenticado.usuario,
        tipo: usuarioAutenticado.tipo
      }
    });

  } catch (erro) {
    console.error(erro);

    return res.status(erro.statusCode || 500).json({
      sucesso: false,
      mensagem: erro.message || "Erro interno"
    });
  }
}

module.exports = {
  login
};