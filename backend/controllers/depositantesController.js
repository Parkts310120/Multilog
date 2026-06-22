const depositantesService = require("../services/depositantesService");

async function listarDepositantesAtivos(req,res){
  try{
    const depositantes = await depositantesService.listarDepositantesAtivos();

    return res.json({
      sucesso:true,
      depositantes
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao carregar depositantes"
    });
  }
}

async function listarDepositantesAdmin(req,res){
  try{
    const depositantes = await depositantesService.listarDepositantesAdmin();

    return res.json({
      sucesso:true,
      depositantes
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao listar depositantes"
    });
  }
}

async function cadastrarDepositante(req,res){
  try{
    const {nome}=req.body;

    if(!nome){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome do depositante é obrigatório"
      });
    }

    await depositantesService.cadastrarDepositante(nome);

    return res.json({
      sucesso:true,
      mensagem:"Depositante cadastrado com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar depositante"
    });
  }
}

async function cadastrarDepositantesEmMassa(req,res){
  try{
    const {itens}=req.body;

    if(!Array.isArray(itens)||itens.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista de depositantes vazia"
      });
    }

    const total = await depositantesService.cadastrarDepositantesEmMassa(itens);

    return res.json({
      sucesso:true,
      mensagem:`${total} depositantes cadastrados`
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar depositantes em massa"
    });
  }
}

module.exports = {
  listarDepositantesAtivos,
  listarDepositantesAdmin,
  cadastrarDepositante,
  cadastrarDepositantesEmMassa
};
