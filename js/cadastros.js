function getToken(){
return localStorage.getItem('multilog_token');
}

function mostrarSecao(id){
document.getElementById('menu-cadastros').style.display='none';
document.querySelectorAll('.secao-cadastro').forEach(secao=>secao.style.display='none');
document.getElementById(id).style.display='block';
window.scrollTo({top:0,behavior:'smooth'});
}

function voltarMenuCadastros(){
document.getElementById('menu-cadastros').style.display='block';
document.querySelectorAll('.secao-cadastro').forEach(secao=>secao.style.display='none');
window.scrollTo({top:0,behavior:'smooth'});
}

async function addUsuarioSistema(){
const nome=document.getElementById('novo-usuario-nome').value.trim();
const usuario=document.getElementById('novo-usuario-login').value.trim();
const senha=document.getElementById('novo-usuario-senha').value.trim();
if(!nome||!usuario||!senha)return alert('Preencha nome, login e senha.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/usuarios`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome,usuario,senha})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar admin.');
alert(resultado.mensagem||'Admin cadastrado!');
}

async function addExecutante(){
const nome=document.getElementById('novo-executante').value.trim();
const codigo=document.getElementById('novo-codigo').value.trim();
if(!nome||!codigo)return alert('Digite nome e matrícula.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/executantes`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome,codigo})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar executante.');
alert(resultado.mensagem);
}

async function addUsuariosEmMassa(){
const texto=document.getElementById('usuarios-massa').value.trim();
if(!texto)return alert('Cole a lista.');
const usuarios=texto.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
const p=l.split('_');
return{usuario:p[0].trim(),senha:p[0].trim(),nome:p.slice(1).join('_').trim()};
}).filter(u=>u.usuario&&u.nome);
const resposta=await fetch(`${API_BASE_URL}/api/admin/executantes/massa`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({usuarios})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar funcionários.');
alert(resultado.mensagem);
}

async function addDepositante(){
const nome=document.getElementById('novo-depositante').value.trim();
if(!nome)return alert('Digite o depositante.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/depositantes`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar depositante.');
alert(resultado.mensagem||'Depositante cadastrado!');
}

async function addAtividadeCadastro(){
const nome=document.getElementById('nova-atividade').value.trim();
if(!nome)return alert('Digite o serviço.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/servicos`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar serviço.');
alert(resultado.mensagem||'Serviço cadastrado!');
}

async function addDepositantesEmMassa(){
const texto=document.getElementById('depositantes-massa').value.trim();
if(!texto)return alert('Cole pelo menos um depositante.');
const itens=texto.split(/\r?\n/).map(nome=>nome.trim()).filter(Boolean);
const resposta=await fetch(`${API_BASE_URL}/api/admin/depositantes/massa`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({itens})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar depositantes.');
alert(resultado.mensagem);
}

async function addServicosEmMassa(){
const texto=document.getElementById('servicos-massa').value.trim();
if(!texto)return alert('Cole pelo menos um serviço.');
const itens=texto.split(/\r?\n/).map(nome=>nome.trim()).filter(Boolean);
const resposta=await fetch(`${API_BASE_URL}/api/admin/servicos/massa`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({itens})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao cadastrar serviços.');
alert(resultado.mensagem);
}

async function addArea(){
const nome=document.getElementById('nova-area').value.trim();
if(!nome)return alert('Digite a área.');

const resposta=await fetch(`${API_BASE_URL}/api/admin/areas`,{
method:'POST',
headers:{
'Content-Type':'application/json',
'Authorization':`Bearer ${getToken()}`
},
body:JSON.stringify({nome})
});

const resultado=await resposta.json();

if(!resposta.ok||!resultado.sucesso){
return alert(resultado.mensagem||'Erro ao cadastrar área.');
}

alert(resultado.mensagem||'Área cadastrada!');
}

async function addAreasEmMassa(){
const texto=document.getElementById('areas-massa').value.trim();
if(!texto)return alert('Cole pelo menos uma área.');

const itens=texto
.split(/\r?\n/)
.map(nome=>nome.trim())
.filter(Boolean);

const resposta=await fetch(`${API_BASE_URL}/api/admin/areas/massa`,{
method:'POST',
headers:{
'Content-Type':'application/json',
'Authorization':`Bearer ${getToken()}`
},
body:JSON.stringify({itens})
});

const resultado=await resposta.json();

if(!resposta.ok||!resultado.sucesso){
return alert(resultado.mensagem||'Erro ao cadastrar áreas.');
}

alert(resultado.mensagem);
}

function abrirTabela(titulo,colunas,linhas){
const html=`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/cadastros.css">
</head>
<body>
<div class="container">
<h1>${titulo}</h1>
<button onclick="window.location.href='admin-cadastros.html'">⬅️ Voltar para Cadastros</button>

<div class="card">
<div class="table-container">
<table>
<thead>
<tr>${colunas.map(c=>`<th>${c}</th>`).join('')}</tr>
</thead>
<tbody>
${linhas.map(l=>`<tr>${l.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
</tbody>
</table>
</div>
</div>
</div>
</body>
</html>`;

document.open();
document.write(html);
document.close();
}

async function abrirPaginaUsuarios(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/usuarios`,{
headers:{'Authorization':`Bearer ${getToken()}`}
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao carregar usuários.');
abrirTabela('Usuários Cadastrados',['Nome','Login','Tipo','Status'],resultado.usuarios.map(x=>[x.nome,x.usuario,x.tipo,x.ativo?'Ativo':'Inativo']));
}

async function abrirPaginaDepositantes(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/depositantes`,{
headers:{'Authorization':`Bearer ${getToken()}`}
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao carregar depositantes.');
abrirTabela('Depositantes Cadastrados',['Nome','Status'],resultado.depositantes.map(x=>[x.nome,x.ativo?'Ativo':'Inativo']));
}

async function abrirPaginaServicos(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/servicos`,{
headers:{'Authorization':`Bearer ${getToken()}`}
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return alert(resultado.mensagem||'Erro ao carregar serviços.');
abrirTabela('Serviços Cadastrados',['Nome','Status'],resultado.servicos.map(x=>[x.nome,x.ativo?'Ativo':'Inativo']));
}

function voltarPortalAdmin(){
const usuarioSalvo=localStorage.getItem('multilog_usuario');

if(!usuarioSalvo){
window.location.href='index.html';
return;
}

const usuario=JSON.parse(usuarioSalvo);

if(usuario.tipo==='admin'){
window.location.href='index.html?admin=1';
}else{
window.location.href='index.html';
}
}
async function abrirPaginaAreas(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/areas`,{
headers:{
'Authorization':`Bearer ${getToken()}`
}
});

const resultado=await resposta.json();

if(!resposta.ok||!resultado.sucesso){
return alert(resultado.mensagem||'Erro ao carregar áreas.');
}

abrirTabela(
'Áreas Cadastradas',
['Nome','Status'],
resultado.areas.map(x=>[x.nome,x.ativo?'Ativo':'Inativo'])
);
}
