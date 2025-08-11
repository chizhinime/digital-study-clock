// Digital clock logic
(() => {
  const $ = (id) => document.getElementById(id);

  const hoursEl = $('hours');
  const minutesEl = $('minutes');
  const secondsEl = $('seconds');
  const ampmEl = $('ampm');
  const dateEl = $('date');
  const themeToggle = $('themeToggle');
  const fullToggle = $('fullToggle');
  const settingsBtn = $('settingsBtn');
  const settingsPanel = $('settings');
  const showSeconds = $('showSeconds');
  const leadingZero = $('leadingZero');
  const use12Hour = $('use12Hour');
  const resetPrefs = $('resetPrefs');
  const app = document.getElementById('app');

  const PREF_KEY = 'techiesClockPrefs_v1';

  const defaultPrefs = {
    theme: (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark',
    showSeconds: true,
    leadingZero: true,
    use12Hour: true
  };

  // load & save
  function loadPrefs(){
    try{
      const raw = localStorage.getItem(PREF_KEY);
      if(!raw) return {...defaultPrefs};
      return Object.assign({}, defaultPrefs, JSON.parse(raw));
    }catch(e){return {...defaultPrefs};}
  }
  function savePrefs(p){ localStorage.setItem(PREF_KEY, JSON.stringify(p)); }

  let prefs = loadPrefs();

  // apply prefs to UI
  function applyPrefs(){
    document.body.classList.toggle('light-theme', prefs.theme === 'light');
    themeToggle.setAttribute('aria-pressed', String(prefs.theme === 'light'));
    showSeconds.checked = prefs.showSeconds;
    leadingZero.checked = prefs.leadingZero;
    use12Hour.checked = prefs.use12Hour;
    settingsPanel.classList.toggle('hidden', false);
    settingsPanel.style.display = 'block';
    // hide seconds display
    secondsEl.parentElement.classList.toggle('hide-seconds', !prefs.showSeconds);
  }

  applyPrefs();

  // update time
  function pad(n){ return n < 10 ? '0'+n : String(n); }
  function formatHour(h){
    if(prefs.use12Hour){
      const t = h % 12 || 12;
      return prefs.leadingZero ? pad(t) : String(t);
    }
    return prefs.leadingZero ? pad(h) : String(h);
  }

  function update(){
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const displayHour = formatHour(h);
    hoursEl.textContent = displayHour;
    minutesEl.textContent = prefs.leadingZero ? pad(m) : String(m);
    secondsEl.textContent = prefs.leadingZero ? pad(s) : String(s);
    ampmEl.textContent = (h >= 12) ? 'PM' : 'AM';

    // date
    const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, opts);
  }

  // initial update + interval
  update();
  setInterval(update, 250);

  // theme toggle
  themeToggle.addEventListener('click', ()=>{
    prefs.theme = (prefs.theme === 'light') ? 'dark' : 'light';
    savePrefs(prefs);
    applyPrefs();
  });

  // fullscreen
  function isFull(){ return document.fullscreenElement != null; }
  function toggleFull(){
    if(isFull()) document.exitFullscreen().catch(()=>{});
    else document.documentElement.requestFullscreen().catch(()=>{});
  }
  fullToggle.addEventListener('click', toggleFull);

  // keyboard shortcuts
  window.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === 'f') toggleFull();
    if(e.key.toLowerCase() === 't') themeToggle.click();
    if(e.key === 'Escape' && isFull()) document.exitFullscreen().catch(()=>{});
  });

  // settings panel
  settingsBtn.addEventListener('click', ()=>{
    const expanded = settingsBtn.getAttribute('aria-expanded') === 'true';
    settingsBtn.setAttribute('aria-expanded', String(!expanded));
    settingsPanel.classList.toggle('hidden');
    settingsPanel.setAttribute('aria-hidden', String(expanded));
  });

  // settings inputs
  showSeconds.addEventListener('change', ()=>{ prefs.showSeconds = showSeconds.checked; savePrefs(prefs); applyPrefs(); });
  leadingZero.addEventListener('change', ()=>{ prefs.leadingZero = leadingZero.checked; savePrefs(prefs); applyPrefs(); });
  use12Hour.addEventListener('change', ()=>{ prefs.use12Hour = use12Hour.checked; savePrefs(prefs); applyPrefs(); update(); });

  resetPrefs.addEventListener('click', ()=>{
    prefs = {...defaultPrefs}; savePrefs(prefs); applyPrefs(); update();
  });

  // accessibility: trap focus in settings when opened (simple)
  settingsBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') settingsBtn.click(); });

  // expose for debugging
  window.techiesClock = {prefs, savePrefs, loadPrefs};
})();
