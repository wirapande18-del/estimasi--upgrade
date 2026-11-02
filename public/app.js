let session=loadSession();
let customers=loadCustomers();
let whatsappTemplate=session ? loadWhatsappTemplate(session.username) : DEFAULT_WHATSAPP_TEMPLATE;
let currentPage='dashboard';
let filters={search:'',status:'all',sa:'all'};
let whatsappId=null;
let surveyId=null;

function esc(value=''){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function normalizePhone(value=''){
  let digits=String(value).replace(/\D/g,'');
  if(digits.startsWith('0')) digits='62'+digits.slice(1);
  if(!digits.startsWith('62')) digits='62'+digits;
  return digits;
}
function calculateAverage(item){
  const vals=QUESTIONS.map((_,i)=>Number(item.scores?.['q'+(i+1)])).filter(v=>v>=1);
  return vals.length ? Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : '';
}
function overallCategory(item){
  const a=calculateAverage(item);
  if(a==='') return '';
  if(a<=6) return 'Tidak Puas';
  if(a<=8) return 'Cukup';
  return 'Puas';
}
function hasCompleteScores(item){
  return QUESTIONS.every((_,i)=>Number(item.scores?.['q'+(i+1)])>=1);
}
function hasLowScore(item){
  return Object.values(item.scores||{}).some(v=>Number(v)<=6);
}
function scoreClass(n){
  if(n<=6) return 'lowbg';
  if(n<=8) return 'midbg';
  return 'highbg';
}
function visibleCustomers(){
  let rows=session.role==='admin'?[...customers]:customers.filter(c=>c.sa===session.username);
  if(filters.search){
    const q=filters.search.toLowerCase();
    rows=rows.filter(c=>[c.customer,c.phone,c.plate,c.model].some(v=>String(v||'').toLowerCase().includes(q)));
  }
  if(filters.status!=='all') rows=rows.filter(c=>c.status===filters.status);
  if(filters.sa!=='all') rows=rows.filter(c=>c.sa===filters.sa);
  return rows;
}
function render(){
  app.innerHTML=session?shellView():loginView();
  session?bindShell():bindLogin();
}
function loginView(){
  return `<div class="login"><div class="login-card"><div class="logo">AT</div><h1>Follow Up After Service</h1><p class="sub">${APP_CONFIG.dealerName}</p><div class="field"><label>Pengguna</label><select id="loginUser">${Object.entries(USERS).map(([k,u])=>`<option value="${k}">${u.name}</option>`).join('')}</select></div><div class="field"><label>Password</label><input id="loginPassword" type="password"></div><button id="loginButton" class="btn primary full">Masuk</button><div class="note">Data dan template disimpan lokal pada browser perangkat ini.</div></div></div>`;
}
function bindLogin(){
  loginButton.onclick=()=>{
    const username=loginUser.value;
    if(USERS[username].password!==loginPassword.value) return alert('Password salah');
    session={username,...USERS[username]};
    saveSession(session);
    whatsappTemplate=loadWhatsappTemplate(username);
    render();
  };
}
function nav(id,label){
  return `<button data-page="${id}" class="${currentPage===id?'active':''}">${label}</button>`;
}
function shellView(){
  return `<div class="shell"><aside class="side"><div><h2>After Service</h2><small>${APP_CONFIG.dealerName}</small></div><div class="nav">${nav('dashboard','Dashboard')}${nav('customers','Follow Up')}${nav('report','Laporan')}${nav('settings','Edit Template WA')}</div><div class="logout"><button id="logoutButton" class="btn">Keluar</button></div></aside><main class="main">${pageView()}</main></div>${whatsappId?whatsappModal():''}${surveyId?surveyModal():''}`;
}
function pageView(){
  if(currentPage==='customers') return customersPage();
  if(currentPage==='report') return reportPage();
  if(currentPage==='settings') return settingsPage();
  return dashboardPage();
}
function topbar(title,subtitle){
  return `<div class="top"><div><h1>${title}</h1><p class="sub">${subtitle}</p></div><div class="chip">${esc(session.name)}</div></div>`;
}
function dashboardPage(){
  const rows=visibleCustomers();
  const sent=rows.filter(c=>c.status==='Sudah Follow Up').length;
  const answered=rows.filter(hasCompleteScores).length;
  const low=rows.filter(hasLowScore).length;
  return `${topbar('Dashboard','Ringkasan follow up pelanggan setelah servis')}<section class="cards"><div class="card"><span>Total Data</span><strong>${rows.length}</strong></div><div class="card"><span>Belum Follow Up</span><strong>${rows.length-sent}</strong></div><div class="card"><span>Sudah Follow Up</span><strong>${sent}</strong></div><div class="card"><span>Respon Lengkap</span><strong>${answered}</strong></div><div class="card"><span>Perlu Tindak Lanjut</span><strong>${low}</strong></div></section><section class="panel"><div class="head"><h3>Data Terbaru</h3><button class="btn primary" data-page="customers">Buka Follow Up</button></div>${customerTable(rows.slice(0,8))}</section>`;
}
function customersPage(){
  const rows=visibleCustomers();
  return `${topbar('Follow Up Pelanggan','Semua akun dapat upload Excel dan menggunakan template masing-masing')}<section class="panel"><div class="head"><h3>Daftar Pelanggan</h3><div class="tools"><label class="btn primary file">Upload Excel<input id="excelInput" type="file" accept=".xlsx,.xls"></label><button id="exportButton" class="btn">Export</button><button id="clearButton" class="btn danger">Hapus Semua</button></div></div><div class="info">Form Isi Nilai sekarang tampil full screen agar nyaman digunakan di tablet dan HP.</div><div class="filters"><input id="searchInput" placeholder="Cari nama, plat, HP..." value="${esc(filters.search)}"><select id="statusFilter"><option value="all">Semua Status</option><option value="Belum Follow Up" ${filters.status==='Belum Follow Up'?'selected':''}>Belum Follow Up</option><option value="Sudah Follow Up" ${filters.status==='Sudah Follow Up'?'selected':''}>Sudah Follow Up</option></select>${session.role==='admin'?`<select id="saFilter"><option value="all">Semua SA</option>${['ayu','ajs','wbn','fik'].map(s=>`<option value="${s}" ${filters.sa===s?'selected':''}>${s.toUpperCase()}</option>`).join('')}</select>`:'<div></div>'}</div>${customerTable(rows)}</section>`;
}
function customerTable(rows){
  if(!rows.length) return `<div class="empty">Belum ada data pelanggan.</div>`;
  return `<div class="wrap"><table><thead><tr><th>Pelanggan</th><th>Kendaraan</th><th>SA</th><th>Status</th><th>Nilai</th><th>Kategori</th><th>Aksi</th></tr></thead><tbody>${rows.map(c=>`<tr><td><b>${esc(c.customer||'-')}</b><small>${esc(c.phone||'-')}</small></td><td>${esc(c.plate||'-')}<small>${esc(c.model||'-')}</small></td><td>${esc((c.sa||'-').toUpperCase())}</td><td>${statusBadge(c)}</td><td>${calculateAverage(c)||'-'}</td><td>${overallCategory(c)||'-'}</td><td><div class="actions"><button class="btn wa" data-wa="${c.id}">Kirim WA</button><button class="btn" data-survey="${c.id}">Isi Nilai</button>${session.role==='admin'?`<button class="btn danger" data-delete="${c.id}">Hapus</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>`;
}
function statusBadge(c){
  if(hasLowScore(c)) return `<span class="badge low">Tindak Lanjut</span>`;
  if(c.status==='Sudah Follow Up') return `<span class="badge done">Sudah Follow Up</span>`;
  return `<span class="badge wait">Belum Follow Up</span>`;
}
function reportPage(){
  const rows=visibleCustomers();
  return `${topbar('Laporan','Nilai rata-rata Q1–Q8')}<section class="panel"><div class="head"><h3>Ringkasan Pertanyaan</h3><button id="exportButton" class="btn">Export Excel</button></div>${questionSummary(rows)}</section><section class="panel"><div class="head"><h3>Perlu Ditindaklanjuti</h3></div>${customerTable(rows.filter(hasLowScore))}</section>`;
}
function questionSummary(rows){
  const answered=rows.filter(c=>Object.keys(c.scores||{}).length);
  if(!answered.length) return `<div class="empty">Belum ada penilaian.</div>`;
  return `<div class="summary">${QUESTIONS.map((q,i)=>{const vals=answered.map(c=>Number(c.scores?.['q'+(i+1)])).filter(Boolean);const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;return `<div class="sumrow"><div>Q${i+1}. ${q}</div><b>${avg?avg.toFixed(2):'-'}</b><div class="bar"><i style="width:${avg*10}%"></i></div></div>`}).join('')}</div>`;
}
function settingsPage(){
  return `${topbar('Edit Template WhatsApp','Template tersimpan khusus akun '+esc(session.name))}<section class="panel"><div class="account-note">Anda sedang mengubah template milik <b>${esc(session.name)}</b>.</div><div class="variable-list">${['{nama}','{plat}','{model}','{nama_sa}','{dealer}','{tanggal}'].map(v=>`<button class="variable" data-variable="${v}">${v}</button>`).join('')}</div><div class="field"><label>Isi Template WhatsApp</label><textarea id="templateEditor" class="template-box">${esc(whatsappTemplate)}</textarea></div><div class="tools"><button id="saveTemplateButton" class="btn primary">Simpan Template Saya</button><button id="previewTemplateButton" class="btn">Preview Contoh</button><button id="copyDefaultButton" class="btn">Salin Template Bawaan</button><button id="resetTemplateButton" class="btn danger">Reset Template Saya</button></div><div id="templatePreview" style="margin-top:16px"></div></section>`;
}
function messageFor(c){
  return whatsappTemplate
    .replaceAll('{nama}',c.customer||'')
    .replaceAll('{plat}',c.plate||'')
    .replaceAll('{model}',c.model||'')
    .replaceAll('{nama_sa}',session.name)
    .replaceAll('{dealer}',APP_CONFIG.dealerName)
    .replaceAll('{tanggal}',new Date().toLocaleDateString('id-ID'));
}
function whatsappModal(){
  const c=customers.find(x=>x.id===whatsappId);
  if(!c) return '';
  return `<div class="modal"><div class="modal-card"><button id="closeWa" class="close">×</button><h2>Preview WhatsApp</h2><p>${esc(c.customer)} — ${esc(c.plate)}</p><div class="preview">${esc(messageFor(c))}</div><div class="tools" style="margin-top:14px"><button id="openWa" class="btn wa">Buka WhatsApp</button><button id="cancelWa" class="btn">Batal</button></div></div></div>`;
}
function surveyModal(){
  const c=customers.find(x=>x.id===surveyId);
  if(!c) return '';
  return `<div class="survey-modal">
    <div class="survey-header">
      <div>
        <h2>Penilaian Pelanggan</h2>
        <p>${esc(c.customer)} — ${esc(c.plate)}</p>
      </div>
      <button id="closeSurvey" class="survey-close">×</button>
    </div>
    <div class="survey-body">
      <div class="legend"><span>1–6 Tidak Puas</span><span>7–8 Cukup</span><span>9–10 Puas</span></div>
      ${QUESTIONS.map((q,i)=>{
        const key='q'+(i+1),value=c.scores?.[key];
        return `<div class="question"><div class="qtitle">Q${i+1}. ${q}</div><div class="scores">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="score ${value===n?'active '+scoreClass(n):''}" data-score-key="${key}" data-score-value="${n}">${n}</button>`).join('')}</div></div>`;
      }).join('')}
      <div class="field"><label>Q9. Saran atau masukan</label><textarea id="suggestion" rows="6">${esc(c.suggestion||'')}</textarea></div>
      <div class="field"><label>Status tindak lanjut</label><select id="followStatus"><option value="">Belum ditentukan</option><option ${c.followStatus==='Menunggu'?'selected':''}>Menunggu</option><option ${c.followStatus==='Sudah Dihubungi'?'selected':''}>Sudah Dihubungi</option><option ${c.followStatus==='Selesai'?'selected':''}>Selesai</option></select></div>
    </div>
    <div class="survey-footer">
      <button id="saveSurvey" class="btn primary full">Simpan Penilaian</button>
    </div>
  </div>`;
}
function bindShell(){
  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{currentPage=b.dataset.page;render()});
  logoutButton.onclick=()=>{clearSession();session=null;whatsappTemplate=DEFAULT_WHATSAPP_TEMPLATE;render()};

  const excel=document.getElementById('excelInput');
  if(excel) excel.onchange=async e=>{
    try{
      const result=await readCustomerExcel(e.target.files[0],customers,session.username);
      customers=[...customers,...result.imported];
      saveCustomers(customers);
      alert(`Upload berhasil\n\nTotal baris: ${result.totalRows}\nData baru: ${result.imported.length}\nDuplikat: ${result.duplicates}`);
      render();
    }catch(err){
      console.error(err);
      alert('File Excel gagal dibaca');
    }
  };

  const exp=document.getElementById('exportButton');
  if(exp) exp.onclick=()=>{
    const rows=visibleCustomers();
    if(!rows.length) return alert('Belum ada data');
    exportCustomersToExcel(rows);
  };

  const clear=document.getElementById('clearButton');
  if(clear) clear.onclick=()=>{
    if(confirm('Hapus semua data lokal?')){
      customers=[];
      saveCustomers(customers);
      render();
    }
  };

  const search=document.getElementById('searchInput');
  if(search) search.oninput=e=>{filters.search=e.target.value;render()};

  const status=document.getElementById('statusFilter');
  if(status) status.onchange=e=>{filters.status=e.target.value;render()};

  const saf=document.getElementById('saFilter');
  if(saf) saf.onchange=e=>{filters.sa=e.target.value;render()};

  document.querySelectorAll('[data-wa]').forEach(b=>b.onclick=()=>{whatsappId=b.dataset.wa;render()});
  document.querySelectorAll('[data-survey]').forEach(b=>b.onclick=()=>{surveyId=b.dataset.survey;render()});
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{
    if(confirm('Hapus pelanggan ini?')){
      customers=customers.filter(c=>c.id!==b.dataset.delete);
      saveCustomers(customers);
      render();
    }
  });

  document.querySelectorAll('[data-variable]').forEach(button=>{
    button.onclick=()=>{
      const editor=document.getElementById('templateEditor');
      const text=button.dataset.variable;
      const start=editor.selectionStart;
      const end=editor.selectionEnd;
      editor.value=editor.value.slice(0,start)+text+editor.value.slice(end);
      editor.focus();
      editor.selectionStart=editor.selectionEnd=start+text.length;
    };
  });

  const saveTemplate=document.getElementById('saveTemplateButton');
  if(saveTemplate) saveTemplate.onclick=()=>{
    const value=document.getElementById('templateEditor').value.trim();
    if(!value) return alert('Template tidak boleh kosong');
    whatsappTemplate=value;
    saveWhatsappTemplate(session.username,value);
    alert(`Template ${session.name} berhasil disimpan`);
  };

  const previewTemplate=document.getElementById('previewTemplateButton');
  if(previewTemplate) previewTemplate.onclick=()=>{
    const value=document.getElementById('templateEditor').value;
    const example=value
      .replaceAll('{nama}','Contoh Pelanggan')
      .replaceAll('{plat}','DK 1234 AB')
      .replaceAll('{model}','Avanza')
      .replaceAll('{nama_sa}',session.name)
      .replaceAll('{dealer}',APP_CONFIG.dealerName)
      .replaceAll('{tanggal}',new Date().toLocaleDateString('id-ID'));
    document.getElementById('templatePreview').innerHTML=`<h3>Preview Contoh</h3><div class="preview">${esc(example)}</div>`;
  };

  const copyDefault=document.getElementById('copyDefaultButton');
  if(copyDefault) copyDefault.onclick=()=>{
    document.getElementById('templateEditor').value=DEFAULT_WHATSAPP_TEMPLATE;
  };

  const resetTemplate=document.getElementById('resetTemplateButton');
  if(resetTemplate) resetTemplate.onclick=()=>{
    if(!confirm(`Reset template milik ${session.name}?`)) return;
    resetWhatsappTemplate(session.username);
    whatsappTemplate=DEFAULT_WHATSAPP_TEMPLATE;
    render();
  };

  if(whatsappId) bindWhatsapp();
  if(surveyId) bindSurvey();
}
function bindWhatsapp(){
  const c=customers.find(x=>x.id===whatsappId);
  closeWa.onclick=()=>{whatsappId=null;render()};
  cancelWa.onclick=()=>{whatsappId=null;render()};
  openWa.onclick=()=>{
    window.open(`https://wa.me/${normalizePhone(c.phone)}?text=${encodeURIComponent(messageFor(c))}`,'_blank');
    c.status='Sudah Follow Up';
    c.followUpAt=new Date().toISOString();
    c.followUpBy=session.username;
    saveCustomers(customers);
    whatsappId=null;
    render();
  };
}
function bindSurvey(){
  const c=customers.find(x=>x.id===surveyId);
  c.scores=c.scores||{};
  closeSurvey.onclick=()=>{surveyId=null;render()};
  document.querySelectorAll('[data-score-key]').forEach(b=>b.onclick=()=>{
    c.scores[b.dataset.scoreKey]=Number(b.dataset.scoreValue);
    saveCustomers(customers);
    render();
  });
  saveSurvey.onclick=()=>{
    c.suggestion=suggestion.value;
    c.followStatus=followStatus.value;
    c.responseAt=new Date().toISOString();
    saveCustomers(customers);
    surveyId=null;
    render();
  };
}
render();
