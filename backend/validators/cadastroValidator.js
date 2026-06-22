function validarNome(nome, campo="Nome"){
  if(!nome || !String(nome).trim()){
    const erro = new Error(`${campo} é obrigatório`);
    erro.statusCode = 400;
    throw erro;
  }
}

function validarLista(itens, mensagem="Lista vazia"){
  if(!Array.isArray(itens) || itens.length === 0){
    const erro = new Error(mensagem);
    erro.statusCode = 400;
    throw erro;
  }
}

function validarUsuarioAdmin({nome,usuario,senha}){
  const erros=[];

  if(!nome) erros.push("Nome é obrigatório");
  if(!usuario) erros.push("Usuário é obrigatório");
  if(!senha) erros.push("Senha é obrigatória");

  if(erros.length > 0){
    const erro = new Error(erros.join(", "));
    erro.statusCode = 400;
    throw erro;
  }
}

function validarExecutante({nome,codigo}){
  const erros=[];

  if(!nome) erros.push("Nome é obrigatório");
  if(!codigo) erros.push("Matrícula é obrigatória");

  if(erros.length > 0){
    const erro = new Error(erros.join(", "));
    erro.statusCode = 400;
    throw erro;
  }
}

module.exports = {
  validarNome,
  validarLista,
  validarUsuarioAdmin,
  validarExecutante
};
