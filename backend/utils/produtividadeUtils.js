function calcularHorasPorSegundos(segundos){
  return Number(segundos || 0) / 3600;
}

function calcularProdutividadeHora(quantidade, segundos){
  const horas = calcularHorasPorSegundos(segundos);

  if(horas <= 0){
    return 0;
  }

  return Number((Number(quantidade || 0) / horas).toFixed(2));
}

module.exports = {
  calcularHorasPorSegundos,
  calcularProdutividadeHora
};
