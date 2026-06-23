let usuarioLogado=null;
let currentSession=null;
let timerInterval=null;

document.addEventListener('DOMContentLoaded',()=>{
    const usuarioSalvo=localStorage.getItem('multilog_usuario');
    const token=localStorage.getItem('multilog_token');

    if(usuarioSalvo&&token){
        usuarioLogado=JSON.parse(usuarioSalvo);
        showAppScreen();
    }else{
        showLoginScreen();
    }

    atualizarIndicadorOffline();

    setInterval(() => {
        atualizarIndicadorOffline();
    }, 5000);

    window.addEventListener('online', atualizarIndicadorOffline);
    window.addEventListener('offline', atualizarIndicadorOffline);    

});

async function handleLogin(){
    const userIn=document.getElementById('login-username').value.trim();
    const passIn=document.getElementById('login-password').value.trim();
    const errorEl=document.getElementById('login-error');

    try{
        const resultado=await apiPost('/api/login',{
            usuario:userIn,
            senha:passIn
        });

        localStorage.setItem('multilog_token',resultado.token);
        localStorage.setItem('multilog_usuario',JSON.stringify(resultado.usuario));

        usuarioLogado=resultado.usuario;
        errorEl.style.display='none';
        showAppScreen();

    }catch(erro){
        errorEl.innerText=erro.message||'Usuário ou senha incorretos!';
        errorEl.style.display='block';
        console.error(erro);
    }
}

function handleLogout(){
    if(currentSession){
        alert('Finalize a atividade em andamento antes de sair!');
        return;
    }

    localStorage.removeItem('multilog_token');
    localStorage.removeItem('multilog_usuario');

    showLoginScreen();
}

async function atualizarIndicadorOffline(){
    const statusEl=document.getElementById('offline-status');

    if(!statusEl)return;

    let pendentes=0;

    try{
        pendentes=await contarOffline();
    }catch(erro){
        console.error('Erro ao contar atividades offline:', erro);
    }

    if(navigator.onLine){
        if(pendentes>0){
            statusEl.innerText=`🟢 Online (${pendentes} pendentes)`;
        }else{
            statusEl.innerText='🟢 Online';
        }
    }else{
        if(pendentes>0){
            statusEl.innerText=`🔴 Offline (${pendentes} pendentes)`;
        }else{
            statusEl.innerText='🔴 Offline';
        }
    }
}

function showLoginScreen(){
    usuarioLogado=null;
    currentSession=null;
    clearInterval(timerInterval);

    document.getElementById('login-screen').style.display='block';
    document.getElementById('app-screen').style.display='none';
    document.getElementById('admin-buttons').style.display='none';
    document.getElementById('tracking-card').style.display='block';
}

function showAppScreen(){
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app-screen').style.display='block';
    document.getElementById('executante-logado').value=usuarioLogado.nome+' ('+usuarioLogado.usuario+')';

    const isAdmin=usuarioLogado&&usuarioLogado.tipo==='admin';

    if(isAdmin){
        document.getElementById('app-title').innerText='Portal Administrativo';
        document.getElementById('app-subtitle').innerText='Acesse histórico, relatórios e cadastros';
        document.getElementById('tracking-card').style.display='none';
        document.getElementById('admin-buttons').style.display='block';
    }else{
        document.getElementById('app-title').innerText='Registro de Atividade';
        document.getElementById('app-subtitle').innerText='Selecione os dados cadastrados e registre o tempo';
        document.getElementById('tracking-card').style.display='block';
        document.getElementById('admin-buttons').style.display='none';
        initAppLogic();
    }
}

async function initAppLogic(){
    document.getElementById('depositor-name').disabled=false;
    document.getElementById('activity-name').disabled=false;
    document.getElementById('area-name').disabled=false;
    document.getElementById('lote').disabled=false;
    document.getElementById('tem-quantidade-esperada').disabled=false;
    document.getElementById('quantidade-esperada').disabled=false;
    document.getElementById('unidade').disabled=false;
    document.getElementById('quantidade-realizada').disabled=false;
    document.getElementById('observacao').disabled=false;

    document.getElementById('grupo-quantidade-realizada').style.display='none';
    document.getElementById('grupo-observacao').style.display='none';

    document.getElementById('btn-start').disabled=false;
    document.getElementById('btn-end').disabled=true;

    alternarQuantidadeEsperada();

    clearInterval(timerInterval);
    updateStatusUI(false);

    await carregarCadastros();
}

async function carregarCadastros(){
    try{
        const [resultDepositantes,resultServicos,resultAreas]=await Promise.all([
            apiGet('/api/depositantes'),
            apiGet('/api/servicos'),
            apiGet('/api/areas')
        ]);

        const depositantes=resultDepositantes.depositantes;
        const servicos=resultServicos.servicos;
        const areas=resultAreas.areas;

        const depSelect=document.getElementById('depositor-name');
        const ativSelect=document.getElementById('activity-name');
        const areaSelect=document.getElementById('area-name');

        depSelect.innerHTML='';
        ativSelect.innerHTML='';
        areaSelect.innerHTML='';

        if(!depositantes||depositantes.length===0){
            depSelect.innerHTML='<option value="">Nenhum depositante cadastrado</option>';
        }else{
            depSelect.innerHTML='<option value="">Selecione o depositante</option>';
            depositantes.forEach(d=>{
                depSelect.innerHTML+=`<option value="${d.nome}">${d.nome}</option>`;
            });
        }

        if(!servicos||servicos.length===0){
            ativSelect.innerHTML='<option value="">Nenhum serviço cadastrado</option>';
        }else{
            ativSelect.innerHTML='<option value="">Selecione o serviço</option>';
            servicos.forEach(s=>{
                ativSelect.innerHTML+=`<option value="${s.nome}">${s.nome}</option>`;
            });
        }

        if(!areas||areas.length===0){
            areaSelect.innerHTML='<option value="">Nenhuma área cadastrada</option>';
        }else{
            areaSelect.innerHTML='<option value="">Selecione a área</option>';
            areas.forEach(a=>{
                areaSelect.innerHTML+=`<option value="${a.nome}">${a.nome}</option>`;
            });
        }

    }catch(erro){
        console.error(erro);
        alert(erro.message||'Erro ao conectar com a API para carregar cadastros.');
    }
}

function updateStatusUI(isRunning){
    const container=document.getElementById('status-container');
    const timerEl=document.getElementById('live-timer');

    if(isRunning){
        container.innerHTML='<span class="status-badge status-running">Atividade em andamento...</span>';
        timerEl.style.display='block';
    }else{
        container.innerHTML='<span class="status-badge status-free">Pronto para iniciar</span>';
        timerEl.style.display='none';
        timerEl.innerText='00:00:00';
    }
}

function startLiveTimerUpdate(startTime){
    const timerEl=document.getElementById('live-timer');
    clearInterval(timerInterval);

    function update(){
        const diff=new Date()-startTime;
        const hrs=Math.floor(diff/3600000).toString().padStart(2,'0');
        const mins=Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const secs=Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        timerEl.innerText=`${hrs}:${mins}:${secs}`;
    }

    update();
    timerInterval=setInterval(update,1000);
}

function alternarQuantidadeEsperada(){
    const temQuantidadeEsperada=document.getElementById('tem-quantidade-esperada').value;
    const grupoQuantidadeEsperada=document.getElementById('grupo-quantidade-esperada');
    const campoQuantidadeEsperada=document.getElementById('quantidade-esperada');

    if(temQuantidadeEsperada==='sim'){
        grupoQuantidadeEsperada.style.display='block';
        campoQuantidadeEsperada.disabled=false;
    }else{
        grupoQuantidadeEsperada.style.display='none';
        campoQuantidadeEsperada.value='';
        campoQuantidadeEsperada.disabled=true;
    }
}

function startTracking(){
    const user=usuarioLogado.nome+' ('+usuarioLogado.usuario+')';
    const depositor=document.getElementById('depositor-name').value;
    const name=document.getElementById('activity-name').value;
    const area=document.getElementById('area-name').value;
    const lote=document.getElementById('lote').value.trim();
    const temQuantidadeEsperada=document.getElementById('tem-quantidade-esperada').value;
    let quantidadeEsperada=null;
    const unidade=document.getElementById('unidade').value.trim()||'peça';
    const startTime=new Date();

    if(temQuantidadeEsperada==='sim'){
        quantidadeEsperada=Number(document.getElementById('quantidade-esperada').value||0);

        if(quantidadeEsperada<=0){
            alert('Informe a quantidade esperada ou selecione "Não".');
            return;
        }
    }

    if(!user||!depositor||!name||!area||!lote){
        alert('Preencha depositante, serviço, área e lote.');
        return;
    }

    currentSession={
        user,
        depositor,
        name,
        area,
        lote,
        temQuantidadeEsperada,
        quantidadeEsperada,
        unidade,
        startTime:startTime.toISOString()
    };

    document.getElementById('depositor-name').disabled=true;
    document.getElementById('activity-name').disabled=true;
    document.getElementById('area-name').disabled=true;
    document.getElementById('lote').disabled=true;
    document.getElementById('tem-quantidade-esperada').disabled=true;
    document.getElementById('quantidade-esperada').disabled=true;
    document.getElementById('unidade').disabled=true;

    document.getElementById('grupo-quantidade-realizada').style.display='block';
    document.getElementById('grupo-observacao').style.display='block';

    document.getElementById('quantidade-realizada').disabled=false;
    document.getElementById('observacao').disabled=false;

    document.getElementById('btn-start').disabled=true;
    document.getElementById('btn-end').disabled=false;

    startLiveTimerUpdate(startTime);
    updateStatusUI(true);
}

async function stopTracking(){
    if(!currentSession)return;

    const quantidadeRealizada=Number(document.getElementById('quantidade-realizada').value||0);
    const observacao=document.getElementById('observacao').value.trim();

    let diferencaQuantidade=null;

    if(currentSession.temQuantidadeEsperada==='sim'){
        diferencaQuantidade=quantidadeRealizada-currentSession.quantidadeEsperada;
    }

    if(quantidadeRealizada<=0){
        alert('Informe a quantidade realizada antes de finalizar.');
        return;
    }

    clearInterval(timerInterval);

    const endTime=new Date();
    const startTime=new Date(currentSession.startTime);
    const diffMs=endTime-startTime;
    const diffSegundos=Math.round(diffMs/1000);
    const diffMins=Math.round(diffMs/60000);
    const horas=diffMs/3600000;

    let durationText='';

    if(diffMins<1){
        durationText=`${diffSegundos} segundos`;
    }else if(diffMins<60){
        durationText=`${diffMins} min`;
    }else{
        durationText=`${Math.floor(diffMins/60)}h e ${diffMins%60}min`;
    }

    const produtividadeHora=horas>0 ? Number((quantidadeRealizada/horas).toFixed(2)) : 0;
    const metaHora=0;
    const atingiuMeta=false;

    const idLocal =
        crypto.randomUUID ?
        crypto.randomUUID() :
        `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const dadosAtividade={
        id_local:idLocal,
        usuario:currentSession.user,
        depositante:currentSession.depositor,
        atividade:currentSession.name,
        area:currentSession.area,
        lote:currentSession.lote,
        quantidade_esperada:currentSession.quantidadeEsperada,
        quantidade_realizada:quantidadeRealizada,
        diferenca_quantidade:diferencaQuantidade,
        quantidade:quantidadeRealizada,
        unidade:currentSession.unidade,
        produtividade_hora:produtividadeHora,
        observacao:observacao,
        meta_hora:metaHora,
        atingiu_meta:atingiuMeta,
        inicio:startTime.toISOString(),
        fim:endTime.toISOString(),
        duracao:durationText,
        duracao_segundos:diffSegundos
    };

    let salvoOffline=false;

    try{
        const resultado=await apiPost('/api/atividades',dadosAtividade);
        console.log('RESPOSTA SALVAR ATIVIDADE:', resultado);
    }catch(erro){
        console.error(erro);
        await salvarOffline(dadosAtividade);
        salvoOffline=true;
    }

    let mensagemFinal=`✅ Contagem concluída!\n\n⏱️ Tempo Total: ${durationText}\n✅ Realizado: ${quantidadeRealizada}`;

    if(currentSession.temQuantidadeEsperada==='sim'){
        mensagemFinal+=`\n📦 Esperado: ${currentSession.quantidadeEsperada}`;
        mensagemFinal+=`\n🔁 Diferença: ${diferencaQuantidade}`;
    }

    mensagemFinal+=`\n📊 Produtividade: ${produtividadeHora} por hora`;

    if(salvoOffline){
        mensagemFinal+=`\n\n⚠️ Sem conexão com a API. Atividade salva localmente e será sincronizada automaticamente.`;
    }
    
    await atualizarIndicadorOffline();
    alert(mensagemFinal);

    currentSession=null;

    document.getElementById('depositor-name').disabled=false;
    document.getElementById('activity-name').disabled=false;
    document.getElementById('area-name').disabled=false;
    document.getElementById('lote').disabled=false;
    document.getElementById('tem-quantidade-esperada').disabled=false;
    document.getElementById('quantidade-esperada').disabled=false;
    document.getElementById('quantidade-realizada').disabled=false;
    document.getElementById('unidade').disabled=false;
    document.getElementById('observacao').disabled=false;

    document.getElementById('btn-start').disabled=false;
    document.getElementById('btn-end').disabled=true;

    document.getElementById('grupo-quantidade-realizada').style.display='none';
    document.getElementById('grupo-observacao').style.display='none';

    document.getElementById('lote').value='';
    document.getElementById('tem-quantidade-esperada').value='sim';
    document.getElementById('quantidade-esperada').value='';
    document.getElementById('quantidade-realizada').value='';
    document.getElementById('observacao').value='';
    document.getElementById('unidade').value='peça';

    alternarQuantidadeEsperada();
    updateStatusUI(false);
}
