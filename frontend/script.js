/* Main frontend logic: client generation + backend logging + history + PWA prompt */
(function(){
  const $ = id => document.getElementById(id);
  const out = $('passwordOutput'), genBtn = $('generateBtn'), copyBtn = $('copyBtn');
  const lengthEl = $('length'), upperEl = $('upper'), lowerEl = $('lower'), numbersEl = $('numbers'), symbolsEl = $('symbols');
  const strengthBar = $('strengthBar') || document.querySelector('.strength .bar');
  const entropyText = $('entropyText') || document.getElementById('entropyText');
  const historyList = $('historyList'), clearHistory = $('clearHistory'), exportHistory = $('exportHistory');
  const STORAGE_KEY = 'xd_secure_history_v1';
  const PREF_KEY = 'xd_secure_prefs_v1';

  // theme
  if(!document.documentElement.getAttribute('data-theme')) document.documentElement.setAttribute('data-theme','dark');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function charset(){
    let s='';
    if(upperEl.checked) s += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(lowerEl.checked) s += 'abcdefghijklmnopqrstuvwxyz';
    if(numbersEl.checked) s += '0123456789';
    if(symbolsEl.checked) s += '!@#$%^&*()_+-=[]{};:,.<>?';
    return s;
  }

  function randIndex(max){
    if(window.crypto && crypto.getRandomValues){
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random()*max);
  }

  function generateLocal(){
    const len = Math.max(4, Math.min(128, Number(lengthEl.value||16)));
    const chars = charset();
    if(!chars) { alert('Select at least one character set'); return ''; }
    let p='';
    for(let i=0;i<len;i++) p += chars.charAt(randIndex(chars.length));
    return p;
  }

  function entropyBits(pw){
    const unique = new Set(pw).size || 1;
    const e = Math.log2(Math.pow(unique, pw.length)) || 0;
    return Math.round(e);
  }

  function updateStrength(pw){
    if(!pw) {
      strengthBar.style.width='0%';
      if(entropyText) entropyText.textContent='';
      return;
    }
    const e = entropyBits(pw);
    if(entropyText) entropyText.textContent = e + ' bits';
    const pct = Math.min(100, Math.round((e/128)*100));
    strengthBar.style.width = pct + '%';
  }

  // history storage
  function loadHistory(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ return []; }
  }

  function saveHistory(h){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
    renderHistory(h);
  }

  function addHistory(pw){
    const h = loadHistory();
    h.unshift({pw, at: new Date().toISOString()});
    if(h.length>30) h.pop();
    saveHistory(h);
  }

  function renderHistory(h){
    if(!historyList) return;
    historyList.innerHTML = '';
    h.forEach((it, idx)=> {
      const li = document.createElement('li');
      li.innerHTML = `<span>${it.pw}</span> <div><button data-copy="${idx}">Copy</button> <button data-del="${idx}">Del</button></div>`;
      historyList.appendChild(li);
    });
  }

  if(historyList){
    historyList.addEventListener('click', e=>{
      const copyIdx = e.target.getAttribute('data-copy');
      const delIdx = e.target.getAttribute('data-del');
      const h = loadHistory();
      if(copyIdx !== null) {
        navigator.clipboard.writeText(h[copyIdx].pw);
        flashCopy();
      }
      if(delIdx !== null) {
        h.splice(delIdx,1);
        saveHistory(h);
      }
    });
  }

  if(clearHistory)
    clearHistory.addEventListener('click', ()=>{
      if(confirm('Clear history?')) saveHistory([]);
    });

  // ✅ FIXED EXPORT HISTORY FUNCTION (real line breaks)
  if(exportHistory)
    exportHistory.addEventListener('click', ()=>{
      const h = loadHistory();
      if(h.length === 0) {
        alert("No passwords to export!");
        return;
      }

      // each entry on new line with proper \n
      const txt = h.map(i => `${i.at}\t${i.pw}`).join('\n');
      const blob = new Blob([txt], {type:'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'xd_secure_history.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

  function flashCopy(){
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>copyBtn.textContent='Copy',1500);
  }

  copyBtn.addEventListener('click', ()=>{
    const v = out.value || '';
    if(!v) return;
    navigator.clipboard.writeText(v).then(()=>{ flashCopy(); });
  });

  // Primary flow: generate locally, show, add to history, then notify backend
  genBtn.addEventListener('click', async ()=>{
    const pw = generateLocal();
    out.value = pw;
    updateStrength(pw);
    addHistory(pw);

    try{
      await fetch('/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          length: lengthEl.value,
          upper: upperEl.checked,
          lower: lowerEl.checked,
          numbers: numbersEl.checked,
          symbols: symbolsEl.checked,
          source: 'web'
        })
      });
    }catch(e){}
  });

  // client-only button
  const clientBtn = $('clientBtn');
  if(clientBtn)
    clientBtn.addEventListener('click', ()=>{
      const pw = generateLocal();
      out.value = pw;
      updateStrength(pw);
      addHistory(pw);
    });

  // PWA registration
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{});
  }

  // initial history render
  renderHistory(loadHistory());

  // keyboard shortcut: Ctrl/Cmd + G
  document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey) && e.key==='g') genBtn.click();
  });

})();
