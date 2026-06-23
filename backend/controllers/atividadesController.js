const atividadesService = require("../services/atividadesService");
const auditoriaService = require("../services/auditoriaService");
const { validarAtividade } = require("../validators/atividadeValidator");

async function salvarAtividade(req,res){
  console.log("ATIVIDADE RECEBIDA:", req.body);

  try{
    validarAtividade(req.body);

    await atividadesService.salvarAtividade(req.body);

    await auditoriaService.registrarLog({
      usuario: req.body.usuario || req.usuario?.usuario || "sistema",
      acao: "SALVAR_ATIVIDADE",
      tabela: "atividades",
      registro_id: req.body.id_local ? String(req.body.id_local) : null,
      depois: req.body
    });

    return res.json({
      sucesso:true,
      mensagem:"Atividade salva com sucesso"
    });
  }catch(erro){
    console.error(erro);

    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro interno"
    });
  }
}

async function listarAtividades(req,res){
  try{
    const atividades = await atividadesService.listarAtividadesVisiveis();

    return res.json({
      sucesso:true,
      atividades
    });
  }catch(erro){
    console.error(erro);

    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao carregar histórico"
    });
  }
}

async function ocultarAtividade(req,res){
  try{
    await atividadesService.ocultarAtividade(req.params.id);

    await auditoriaService.registrarLog({
      usuario: req.usuario?.usuario || "sistema",
      acao: "OCULTAR_ATIVIDADE",
      tabela: "atividades",
      registro_id: String(req.params.id)
    });

    return res.json({
      sucesso:true,
      mensagem:"Registro ocultado com sucesso"
    });
  }catch(erro){
    console.error(erro);

    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao ocultar registro"
    });
  }
}

async function ocultarTodasAtividades(req,res){
  try{
    await atividadesService.ocultarTodasAtividades();

    await auditoriaService.registrarLog({
      usuario: req.usuario?.usuario || "sistema",
      acao: "OCULTAR_TODAS_ATIVIDADES",
      tabela: "atividades"
    });

    return res.json({
      sucesso:true,
      mensagem:"Histórico ocultado com sucesso"
    });
  }catch(erro){
    console.error(erro);

    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao ocultar histórico"
    });
  }
}

module.exports = {
  salvarAtividade,
  listarAtividades,
  ocultarAtividade,
  ocultarTodasAtividades
};