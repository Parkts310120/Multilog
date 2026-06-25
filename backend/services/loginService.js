const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");
const { verificarSenha } = require("../utils/password");

async function autenticarUsuario(usuario, senha) {
  const { data, error } = await supabase
    .from("usuarios_sistema")
    .select("*")
    .eq("usuario", usuario)
    .eq("ativo", true)
    .single();

  if (error || !data) {
    const erro = new Error("Usuário ou senha inválidos");
    erro.statusCode = 401;
    throw erro;
  }

  const senhaValida = await verificarSenha(senha, data.senha);

  if (!senhaValida) {
    const erro = new Error("Usuário ou senha inválidos");
    erro.statusCode = 401;
    throw erro;
  }

  return data;
}

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      usuario: usuario.usuario,
      nome: usuario.nome,
      tipo: usuario.tipo
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

module.exports = {
  autenticarUsuario,
  gerarToken
};