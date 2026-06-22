const express = require("express");
const supabase = require("../config/supabase");
const { autenticarToken, autorizarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/servicos", autenticarToken, async (req,res)=>{
  try{
    const {data,error}=await supabase
      .from("atividades_cadastro")
      .select("*")
      .eq("ativo",true)
      .order("nome");

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({sucesso:true,servicos:data});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao carregar serviços"});
  }
});

router.post("/admin/servicos", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {nome}=req.body;

    if(!nome){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome do serviço é obrigatório"
      });
    }

    const {error}=await supabase
      .from("atividades_cadastro")
      .insert({nome,ativo:true});

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      mensagem:"Serviço cadastrado com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar serviço"});
  }
});

router.get("/admin/servicos", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {data,error}=await supabase
      .from("atividades_cadastro")
      .select("id,nome,ativo")
      .order("nome");

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      servicos:data
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao listar serviços"});
  }
});

router.post("/admin/servicos/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {itens}=req.body;

    if(!Array.isArray(itens)||itens.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista de serviços vazia"
      });
    }

    const registros=itens
      .map(nome=>({nome:String(nome).trim(),ativo:true}))
      .filter(x=>x.nome);

    const {error}=await supabase
      .from("atividades_cadastro")
      .upsert(registros,{onConflict:"nome"});

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      mensagem:`${registros.length} serviços cadastrados`
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar serviços em massa"});
  }
});

module.exports = router;
