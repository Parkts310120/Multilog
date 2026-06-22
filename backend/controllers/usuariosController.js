const usuariosService = require("../services/usuariosService");

async function listarUsuarios(req,res){
  try{
    const usuarios = await usuariosService.listarUsuarios();
    return res.json({sucesso:true,usuarios});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao listar usuários"
    });
  }
}

async function cadastrarAdmin(req,res){
  try{
    const {nome,usuario,senha}=req.body;

    if(!nome||!usuario||!senha){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome, usuário e senha são obrigatórios"
      });
    }

    await usuariosService.cadastrarAdmin({nome,usuario,senha});

    return res.json({
      sucesso:true,
      mensagem:"Admin cadastrado com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar admin"
    });
  }
}

async function cadastrarExecutante(req,res){
  try{
    const {nome,codigo}=req.body;

    if(!nome||!codigo){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome e matrícula são obrigatórios"
      });
    }

    await usuariosService.cadastrarExecutante({nome,codigo});

    return res.json({
      sucesso:true,
      mensagem:`Executante cadastrado com sucesso. Login: ${codigo} | Senha: ${codigo}`
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar executante"
    });
  }
}

async function cadastrarExecutantesEmMassa(req,res){
  try{
    const {usuarios}=req.body;

    if(!Array.isArray(usuarios)||usuarios.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista vazia"
      });
    }

    const total = await usuariosService.cadastrarExecutantesEmMassa(usuarios);

    return res.json({
      sucesso:true,
      mensagem:`${total} funcionários cadastrados`
    });
  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar funcionários"
    });
  }
}

module.exports = {
  listarUsuarios,
  cadastrarAdmin,
  cadastrarExecutante,
  cadastrarExecutantesEmMassa
};
