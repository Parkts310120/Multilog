const express = require("express");
const supabase = require("../config/supabase");
const { autenticarToken, autorizarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// LISTAR DEPOSITANTES PARA OPERAÇÃO
router.get("/depositantes", autenticarToken, async (req,res)=>{
  try{
    const {data,error}=await supabase
      .from("depositantes")
      .select("*")
      .eq("ativo",true)
      .order("nome");

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({sucesso:true,depositantes:data});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao carregar depositantes"});
  }
});

// ADMIN - CADASTRAR DEPOSITANTE
router.post("/admin/depositantes", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {nome}=req.body;

    if(!nome){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome do depositante é obrigatório"
      });
    }

    const {error}=await supabase
      .from("depositantes")
      .insert({nome,ativo:true});

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      mensagem:"Depositante cadastrado com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar depositante"});
  }
});

// ADMIN - LISTAR DEPOSITANTES
router.get("/admin/depositantes", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {data,error}=await supabase
      .from("depositantes")
      .select("id,nome,ativo")
      .order("nome");

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      depositantes:data
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao listar depositantes"});
  }
});

// ADMIN - CADASTRAR DEPOSITANTES EM MASSA
router.post("/admin/depositantes/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {itens}=req.body;

    if(!Array.isArray(itens)||itens.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista de depositantes vazia"
      });
    }

    const registros=itens
      .map(nome=>({nome:String(nome).trim(),ativo:true}))
      .filter(x=>x.nome);

    const {error}=await supabase
      .from("depositantes")
      .upsert(registros,{onConflict:"nome"});

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      mensagem:`${registros.length} depositantes cadastrados`
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar depositantes em massa"});
  }
});

module.exports = router;
