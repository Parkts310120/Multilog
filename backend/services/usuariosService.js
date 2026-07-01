const supabase = require("../config/supabase");
const { gerarHashSenha } = require("../utils/password");

async function listarUsuarios(){
  const { data, error } = await supabase
    .from("usuarios_sistema")
    .select("id,nome,usuario,tipo,ativo")
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function cadastrarAdmin({nome,usuario,senha}){
  const senhaHash = await gerarHashSenha(senha);

  const { error } = await supabase
    .from("usuarios_sistema")
    .upsert({
      nome,
      usuario,
      senha: senhaHash,
      tipo:"admin",
      ativo:true
    },{onConflict:"usuario"});

  if(error) throw new Error(error.message);
}

async function cadastrarExecutante({nome,codigo}){
  const senhaHash = await gerarHashSenha(codigo);

  const e1 = await supabase
    .from("executantes")
    .insert({nome,codigo});

  if(e1.error) throw new Error(e1.error.message);

  const e2 = await supabase
    .from("usuarios_sistema")
    .upsert({
      nome,
      usuario:codigo,
      senha:senhaHash,
      tipo:"funcionario",
      ativo:true
    },{onConflict:"usuario"});

  if(e2.error) throw new Error(e2.error.message);
}

async function cadastrarExecutantesEmMassa(usuarios){

  const TAMANHO_LOTE = 25;

  let total = 0;

  for(let i=0;i<usuarios.length;i+=TAMANHO_LOTE){

    const lote = usuarios.slice(i,i+TAMANHO_LOTE);

    const executantes = lote.map(u=>({
      nome:u.nome,
      codigo:u.usuario
    }));

    const usuariosSistema = await Promise.all(
      lote.map(async u=>({
        nome:u.nome,
        usuario:u.usuario,
        senha:await gerarHashSenha(u.senha),
        tipo:"funcionario",
        ativo:true
      }))
    );

    const e1 = await supabase
      .from("executantes")
      .upsert(executantes,{onConflict:"codigo"});

    if(e1.error){
      throw new Error(e1.error.message);
    }

    const e2 = await supabase
      .from("usuarios_sistema")
      .upsert(usuariosSistema,{onConflict:"usuario"});

    if(e2.error){
      throw new Error(e2.error.message);
    }

    total += lote.length;
  }

  return total;
}

module.exports = {
  listarUsuarios,
  cadastrarAdmin,
  cadastrarExecutante,
  cadastrarExecutantesEmMassa
};