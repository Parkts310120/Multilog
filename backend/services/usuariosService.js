const supabase = require("../config/supabase");

async function listarUsuarios(){
  const { data, error } = await supabase
    .from("usuarios_sistema")
    .select("id,nome,usuario,tipo,ativo")
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function cadastrarAdmin({nome,usuario,senha}){
  const { error } = await supabase
    .from("usuarios_sistema")
    .upsert({
      nome,
      usuario,
      senha,
      tipo:"admin",
      ativo:true
    },{onConflict:"usuario"});

  if(error) throw new Error(error.message);
}

async function cadastrarExecutante({nome,codigo}){
  const e1 = await supabase
    .from("executantes")
    .insert({nome,codigo});

  if(e1.error) throw new Error(e1.error.message);

  const e2 = await supabase
    .from("usuarios_sistema")
    .upsert({
      nome,
      usuario:codigo,
      senha:codigo,
      tipo:"funcionario",
      ativo:true
    },{onConflict:"usuario"});

  if(e2.error) throw new Error(e2.error.message);
}

async function cadastrarExecutantesEmMassa(usuarios){
  const executantes = usuarios.map(u=>({
    nome:u.nome,
    codigo:u.usuario
  }));

  const usuariosSistema = usuarios.map(u=>({
    nome:u.nome,
    usuario:u.usuario,
    senha:u.senha,
    tipo:"funcionario",
    ativo:true
  }));

  const e1 = await supabase
    .from("executantes")
    .upsert(executantes,{onConflict:"codigo"});

  if(e1.error) throw new Error(e1.error.message);

  const e2 = await supabase
    .from("usuarios_sistema")
    .upsert(usuariosSistema,{onConflict:"usuario"});

  if(e2.error) throw new Error(e2.error.message);

  return usuarios.length;
}

module.exports = {
  listarUsuarios,
  cadastrarAdmin,
  cadastrarExecutante,
  cadastrarExecutantesEmMassa
};
