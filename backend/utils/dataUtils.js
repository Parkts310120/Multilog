function agoraISO(){
  return new Date().toISOString();
}

function validarDataISO(valor){
  const data = new Date(valor);
  return !isNaN(data.getTime());
}

module.exports = {
  agoraISO,
  validarDataISO
};
