function validarAtividade(dados){
  const erros = [];

  if(!dados.usuario) erros.push("Usuário é obrigatório");
  if(!dados.depositante) erros.push("Depositante é obrigatório");
  if(!dados.atividade) erros.push("Atividade é obrigatória");
  if(!dados.area) erros.push("Área é obrigatória");
  if(!dados.lote) erros.push("Lote é obrigatório");

  if(Number(dados.quantidade_realizada || 0) <= 0){
    erros.push("Quantidade realizada deve ser maior que zero");
  }

  if(!dados.inicio) erros.push("Data/hora de início é obrigatória");
  if(!dados.fim) erros.push("Data/hora de fim é obrigatória");

  if(erros.length > 0){
    const erro = new Error(erros.join(", "));
    erro.statusCode = 400;
    throw erro;
  }
}

module.exports = {
  validarAtividade
};
