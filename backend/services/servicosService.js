const supabase = require("../config/supabase");

async function listarServicosAtivos(){
  const { data, error } = await supabase
    .from("atividades_cadastro")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function listarServicosAdmin(){
  const { data, error } = await supabase
    .from("atividades_cadastro")
    .select("id,nome,ativo")
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function cadastrarServico(nome){
  const { error } = await supabase
    .from("atividades_cadastro")
    .insert({ nome, ativo:true });

  if(error) throw new Error(error.message);
}

async function cadastrarServicosEmMassa(itens){
  const registros = itens
    .map(nome => ({ nome:String(nome).trim(), ativo:true }))
    .filter(x => x.nome);

  const { error } = await supabase
    .from("atividades_cadastro")
    .upsert(registros,{ onConflict:"nome" });

  if(error) throw new Error(error.message);

  return registros.length;
}

module.exports = {
  listarServicosAtivos,
  listarServicosAdmin,
  cadastrarServico,
  cadastrarServicosEmMassa
};
