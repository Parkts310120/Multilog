// js/cadastros.js
function getToken(){
return localStorage.getItem('multilog_token');
}

function mostrarSecao(id){
const titulo = document.getElementById("titulo-cadastros");
if (titulo) titulo.style.display = "none";

document.getElementById('menu-cadastros').style.display='none';
document.querySelectorAll('.secao-cadastro').forEach(secao=>secao.style.display='none');

const secaoSelecionada = document.getElementById(id);

if(secaoSelecionada){
secaoSelecionada.style.display='block';
}

window.scrollTo({top:0,behavior:'instant'});
}

function voltarMenuCadastros(){
const titulo = document.getElementById("titulo-cadastros");
if (titulo) titulo.style.display = "block";

document.getElementById('menu-cadastros').style.display='block';
document.querySelectorAll('.secao-cadastro').forEach(secao=>secao.style.display='none');

const listasContainer = document.getElementById("listas-container");

if(listasContainer){
listasContainer.innerHTML = "";
}

window.history.replaceState({}, "", "admin-cadastros.html");
window.scrollTo({top:0,behavior:'instant'});
}

async function addUsuarioSistema(){
const nome=document.getElementById('novo-usuario-nome').value.trim();
const usuario=document.getElementById('novo-usuario-login').value.trim();
const senha=document.getElementById('novo-usuario-senha').value.trim();
if(!nome||!usuario||!senha)return Toast.warning('Preencha nome, login e senha.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/usuarios`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome,usuario,senha})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao cadastrar admin.');
Toast.success(resultado.mensagem||'Admin cadastrado!');
}

async function addExecutante(){
const nome=document.getElementById('novo-executante').value.trim();
const codigo=document.getElementById('novo-codigo').value.trim();
if(!nome||!codigo)return Toast.warning('Digite nome e matrícula.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/executantes`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome,codigo})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao cadastrar executante.');
Toast.success(resultado.mensagem || "Funcionários cadastrados com sucesso.");
}

async function addUsuariosEmMassa(){
try{
const texto=document.getElementById('usuarios-massa').value.trim();

if(!texto){
return Toast.warning('Cole a lista.');
}

const usuarios=texto.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
const p=l.split('_');
return{usuario:p[0].trim(),senha:p[0].trim(),nome:p.slice(1).join('_').trim()};
}).filter(u=>u.usuario&&u.nome);

if(!usuarios.length){
return Toast.warning('Nenhum funcionário válido encontrado.');
}

const tamanhoLote=50;
let totalCadastrado=0;

for(let i=0;i<usuarios.length;i+=tamanhoLote){
const lote=usuarios.slice(i,i+tamanhoLote);

const resposta=await fetch(`${API_BASE_URL}/api/admin/executantes/massa`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({usuarios:lote})
});

let resultado={};

try{
resultado=await resposta.json();
}catch{
resultado={};
}

if(!resposta.ok){
return Toast.error(resultado.mensagem||`Erro ao cadastrar lote ${Math.floor(i/tamanhoLote)+1}.`);
}

totalCadastrado+=lote.length;
Toast.success(`${totalCadastrado}/${usuarios.length} funcionários cadastrados...`);
}

Toast.success(`${totalCadastrado} funcionário(s) cadastrados com sucesso.`);
document.getElementById('usuarios-massa').value='';

}catch(erro){
console.error(erro);
Toast.error('Erro de conexão ao cadastrar funcionários.');
}
}

async function addDepositante(){
const nome=document.getElementById('novo-depositante').value.trim();
if(!nome)return Toast.warning('Digite o depositante.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/depositantes`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao cadastrar depositante.');
Toast.success(resultado.mensagem||'Depositante cadastrado!');
}

async function addAtividadeCadastro(){
const nome=document.getElementById('nova-atividade').value.trim();
if(!nome)return Toast.warning('Digite o serviço.');
const resposta=await fetch(`${API_BASE_URL}/api/admin/servicos`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({nome})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao cadastrar serviço.');
Toast.success(resultado.mensagem||'Serviço cadastrado!');
}

async function addDepositantesEmMassa(){
const texto=document.getElementById('depositantes-massa').value.trim();
if(!texto)return Toast.warning('Cole pelo menos um depositante.');
const itens=texto.split(/\r?\n/).map(nome=>nome.trim()).filter(Boolean);
const resposta=await fetch(`${API_BASE_URL}/api/admin/depositantes/massa`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({itens})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao cadastrar depositantes.');
Toast.success(resultado.mensagem || "Funcionários cadastrados com sucesso.");
}

async function addServicosEmMassa(){
const texto=document.getElementById('servicos-massa').value.trim();
if(!texto)return Toast.warning('Cole pelo menos um serviço.');
const itens=texto.split(/\r?\n/).map(nome=>nome.trim()).filter(Boolean);
const resposta=await fetch(`${API_BASE_URL}/api/admin/servicos/massa`,{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
body:JSON.stringify({itens})
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao cadastrar serviços.');
Toast.success(resultado.mensagem || "Funcionários cadastrados com sucesso.");
}

async function addArea(){
const nome=document.getElementById('nova-area').value.trim();
if(!nome)return Toast.warning('Digite a área.');

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
return Toast.error(resultado.mensagem||'Erro ao cadastrar área.');
}

Toast.success(resultado.mensagem||'Área cadastrada!');
}

async function addAreasEmMassa(){
const texto=document.getElementById('areas-massa').value.trim();
if(!texto)return Toast.warning('Cole pelo menos uma área.');

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
return Toast.error(resultado.mensagem||'Erro ao cadastrar áreas.');
}

Toast.success(resultado.mensagem || "Funcionários cadastrados com sucesso.");
}

function abrirTabela(titulo, colunas, linhas) {
    const container = document.getElementById("listas-container");

    if (!container) {
        Toast.error("Área de listas não encontrada.");
        return;
    }

    container.innerHTML = `
        <div class="card" style="margin-top:20px;overflow-x:auto;width:100%;">
            <h3>${titulo}</h3>

            <table class="table" style="width:100%;min-width:700px;">
                <thead>
                    <tr>
                        ${colunas.map(c => `<th>${c}</th>`).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${linhas.map(l => `
                        <tr>
                            ${l.map(v => `<td>${v}</td>`).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    window.scrollTo({top:0,behavior:"instant"});
}

async function abrirPaginaUsuarios(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/usuarios`,{
headers:{'Authorization':`Bearer ${getToken()}`}
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao carregar usuários.');
abrirTabela('Usuários Cadastrados',['Nome','Login','Tipo','Status'],resultado.usuarios.map(x=>[x.nome,x.usuario,x.tipo,x.ativo?'Ativo':'Inativo']));
}

async function abrirPaginaDepositantes(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/depositantes`,{
headers:{'Authorization':`Bearer ${getToken()}`}
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao carregar depositantes.');
abrirTabela('Depositantes Cadastrados',['Nome','Status'],resultado.depositantes.map(x=>[x.nome,x.ativo?'Ativo':'Inativo']));
}

async function abrirPaginaServicos(){
const resposta=await fetch(`${API_BASE_URL}/api/admin/servicos`,{
headers:{'Authorization':`Bearer ${getToken()}`}
});
const resultado=await resposta.json();
if(!resposta.ok||!resultado.sucesso)return Toast.error(resultado.mensagem||'Erro ao carregar serviços.');
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
return Toast.error(resultado.mensagem||'Erro ao carregar áreas.');
}

abrirTabela(
'Áreas Cadastradas',
['Nome','Status'],
resultado.areas.map(x=>[x.nome,x.ativo?'Ativo':'Inativo'])
);
}

window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("sec") === "listas" && typeof mostrarSecao === "function") {
        mostrarSecao("sec-listas");
        window.scrollTo({top:0,behavior:"instant"});
    }
});