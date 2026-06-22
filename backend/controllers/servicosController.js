const servicosService = require("../services/servicosService");
const {
  validarNome,
  validarLista
} = require("../validators/cadastroValidator");

async function listarServicosAtivos(req,res){
  try{
    const servicos = await servicosService.listarServicosAtivos();

    return res.json({
      sucesso:true,
      servicos
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao carregar serviços"
    });
  }
}

async function listarServicosAdmin(req,res){
  try{
    const servicos = await servicosService.listarServicosAdmin();

    return res.json({
      sucesso:true,
      servicos
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao listar serviços"
    });
  }
}

async function cadastrarServico(req,res){
  try{
    const {nome}=req.body;

    validarNome(nome,"Nome do serviço");

    await servicosService.cadastrarServico(nome);

    return res.json({
      sucesso:true,
      mensagem:"Serviço cadastrado com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar serviço"
    });
  }
}

async function cadastrarServicosEmMassa(req,res){
  try{
    const {itens}=req.body;

    validarLista(itens,"Lista de serviços vazia");

    const total = await servicosService.cadastrarServicosEmMassa(itens);

    return res.json({
      sucesso:true,
      mensagem:`${total} serviços cadastrados`
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar serviços em massa"
    });
  }
}

module.exports = {
  listarServicosAtivos,
  listarServicosAdmin,
  cadastrarServico,
  cadastrarServicosEmMassa
};
