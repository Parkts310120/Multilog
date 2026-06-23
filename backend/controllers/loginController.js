const loginService = require("../services/loginService");
const { validarLogin } = require("../validators/loginValidator");

async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    validarLogin({ usuario, senha });

    const usuarioAutenticado = await loginService.autenticarUsuario(usuario, senha);

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