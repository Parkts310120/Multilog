const jwt = require("jsonwebtoken");

function autenticarToken(req,res,next){
  const authHeader=req.headers["authorization"];
  const token=authHeader&&authHeader.split(" ")[1];

  if(!token){
    return res.status(401).json({
      sucesso:false,
      mensagem:"Token não informado"
    });
  }

  jwt.verify(token,process.env.JWT_SECRET,(erro,usuario)=>{
    if(erro){
      return res.status(403).json({
        sucesso:false,
        mensagem:"Token inválido ou expirado"
      });
    }

    req.usuario=usuario;
    next();
  });
}

function autorizarAdmin(req,res,next){
  if(!req.usuario||req.usuario.tipo!=="admin"){
    return res.status(403).json({
      sucesso:false,
      mensagem:"Acesso permitido apenas para administradores"
    });
  }

  next();
}

module.exports = {
  autenticarToken,
  autorizarAdmin
};
