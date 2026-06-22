const supabase = require("../config/supabase");

async function listarDepositantesAtivos(){
  const { data, error } = await supabase
    .from("depositantes")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function listarDepositantesAdmin(){
  const { data, error } = await supabase
    .from("depositantes")
    .select("id,nome,ativo")
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function cadastrarDepositante(nome){
  const { error } = await supabase
    .from("depositantes")
    .insert({ nome, ativo:true });

  if(error) throw new Error(error.message);
}

async function cadastrarDepositantesEmMassa(itens){
  const registros = itens
    .map(nome => ({ nome:String(nome).trim(), ativo:true }))
    .filter(x => x.nome);

  const { error } = await supabase
    .from("depositantes")
    .upsert(registros,{ onConflict:"nome" });

  if(error) throw new Error(error.message);

  return registros.length;
}

module.exports = {
  listarDepositantesAtivos,
  listarDepositantesAdmin,
  cadastrarDepositante,
  cadastrarDepositantesEmMassa
};
