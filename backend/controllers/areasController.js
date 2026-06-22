const areasService = require("../services/areasService");

async function listarAreasAtivas(req,res){
  try{
    const areas = await areasService.listarAreasAtivas();
    return res.json({sucesso:true,areas});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao carregar áreas"
    });
  }
}

async function listarAreasAdmin(req,res){
  try{
    const areas = await areasService.listarAreasAdmin();
    return res.json({sucesso:true,areas});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao listar áreas"
    });
  }
}

async function cadastrarArea(req,res){
  try{
    const {nome}=req.body;

    if(!nome){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome da área é obrigatório"
      });
    }

    await areasService.cadastrarArea(nome);

    return res.json({
      sucesso:true,
      mensagem:"Área cadastrada com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar área"
    });
  }
}

async function cadastrarAreasEmMassa(req,res){
  try{
    const {itens}=req.body;

    if(!Array.isArray(itens)||itens.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista de áreas vazia"
      });
    }

    const total = await areasService.cadastrarAreasEmMassa(itens);

    return res.json({
      sucesso:true,
      mensagem:`${total} áreas cadastradas`
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar áreas"
    });
  }
}

module.exports = {
  listarAreasAtivas,
  listarAreasAdmin,
  cadastrarArea,
  cadastrarAreasEmMassa
};
