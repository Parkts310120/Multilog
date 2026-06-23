function validarLogin({ usuario, senha }) {
  if (!usuario || !senha) {
    const erro = new Error("Usuário e senha obrigatórios");
    erro.statusCode = 400;
    throw erro;
  }
}

module.exports = {
  validarLogin
};
