const usuariosService = require("../services/usuariosService");
const auditoriaService = require("../services/auditoriaService");
const {
  validarLista,
  validarUsuarioAdmin,
  validarExecutante
} = require("../validators/cadastroValidator");

async function listarUsuarios(req,res){
  try{
    const usuarios = await usuariosService.listarUsuarios();
    return res.json({sucesso:true,usuarios});
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao listar usuários"
    });
  }
}

async function cadastrarAdmin(req,res){
  try{
    const {nome,usuario,senha}=req.body;

    validarUsuarioAdmin({nome,usuario,senha});

    await usuariosService.cadastrarAdmin({nome,usuario,senha});

    await auditoriaService.registrarLog({
      usuario: req.usuario?.usuario || "sistema",
      acao: "CADASTRAR_ADMIN",
      tabela: "usuarios_sistema",
      depois: {
        nome,
        usuario,
        tipo: "admin"
      }
    });

    return res.json({
      sucesso:true,
      mensagem:"Admin cadastrado com sucesso"
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar admin"
    });
  }
}

async function cadastrarExecutante(req,res){
  try{
    const {nome,codigo}=req.body;

    validarExecutante({nome,codigo});

    await usuariosService.cadastrarExecutante({nome,codigo});

    await auditoriaService.registrarLog({
      usuario: req.usuario?.usuario || "sistema",
      acao: "CADASTRAR_EXECUTANTE",
      tabela: "executantes",
      depois: {
        nome,
        codigo
      }
    });

    return res.json({
      sucesso:true,
      mensagem:`Executante cadastrado com sucesso. Login: ${codigo} | Senha: ${codigo}`
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
      sucesso:false,
      mensagem:erro.message || "Erro ao cadastrar executante"
    });
  }
}

async function cadastrarExecutantesEmMassa(req,res){
  try{
    const {usuarios}=req.body;

    validarLista(usuarios,"Lista vazia");

    const total = await usuariosService.cadastrarExecutantesEmMassa(usuarios);

    await auditoriaService.registrarLog({
      usuario: req.usuario?.usuario || "sistema",
      acao: "CADASTRAR_EXECUTANTES_EM_MASSA",
      tabela: "executantes",
      depois: {
        total
      }
    });

    return res.json({
      sucesso:true,
      mensagem:`${total} funcionários cadastrados`
    });
  }catch(erro){
    console.error(erro);
    return res.status(erro.statusCode || 500).json({
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
