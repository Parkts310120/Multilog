function normalizarTexto(valor){
  return String(valor || "").trim();
}

function normalizarNumero(valor){
  return Number(valor || 0);
}

module.exports = {
  normalizarTexto,
  normalizarNumero
};
