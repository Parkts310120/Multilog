const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

function senhaEstaComHash(senha) {
  return typeof senha === "string" && senha.startsWith("$2");
}

async function gerarHashSenha(senha) {
  return bcrypt.hash(String(senha), SALT_ROUNDS);
}

async function verificarSenha(senhaDigitada, senhaSalva) {
  if (!senhaSalva) {
    return false;
  }

  if (senhaEstaComHash(senhaSalva)) {
    return bcrypt.compare(String(senhaDigitada), senhaSalva);
  }

  return String(senhaDigitada) === String(senhaSalva);
}

module.exports = {
  senhaEstaComHash,
  gerarHashSenha,
  verificarSenha
};
