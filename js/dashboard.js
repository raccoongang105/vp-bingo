// Minimal dashboard interactivity: theme toggle and sample actions
(function(){
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  // Default theme is dark
  const darkTheme = { '--bg':'#0b0e12', '--text':'#e7eef6', '--muted':'#9aa3ad' };
  const lightTheme = { '--bg':'#f7f9fb', '--text':'#0b1220', '--muted':'#6b7280' };

  function applyTheme(theme){
    Object.entries(theme).forEach(([k,v]) => { root.style.setProperty(k, v); });
  }

  // load preference
  const stored = localStorage.getItem('rp-theme');
  if(stored === 'light') applyTheme(lightTheme); else applyTheme(darkTheme);

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const current = localStorage.getItem('rp-theme');
      if(current === 'light'){
        localStorage.setItem('rp-theme', 'dark');
        applyTheme(darkTheme);
        themeToggle.textContent = '🌙';
      } else {
        localStorage.setItem('rp-theme', 'light');
        applyTheme(lightTheme);
        themeToggle.textContent = '☀️';
      }
    });
  }

  // small interactions for card action buttons
  document.querySelectorAll('.card-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('pressed');
      setTimeout(()=>btn.classList.remove('pressed'), 300);
      // For now, just animate a simple refresh
      btn.animate([{ transform: 'rotate(0)'},{ transform: 'rotate(360deg)'}],{duration:300});
    });
  });
  
  // Data loader for static /data JSON files - used for local or GitHub Pages
  async function fetchJson(path){
    try {
      const res = await fetch(path, {cache: 'no-store'});
      if(!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (err){
      console.warn('Failed to fetch '+path, err);
      return null;
    }
  }

  async function loadDashboardData(){
    // Metrics
    const metricEls = document.querySelectorAll('[data-metric]');
    const metrics = await fetchJson('data/metrics.json');
    if(metrics && metricEls.length){
      metricEls.forEach(el => {
        const key = el.dataset.metric;
        if(key && metrics[key] !== undefined){
          el.textContent = metrics[key];
        }
      });
    }

    // Activity
    const activityListEl = document.getElementById('activity-list');
    const activity = await fetchJson('data/activity.json');
    if(activityListEl && Array.isArray(activity)){
      activityListEl.innerHTML = '';
      activity.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        activityListEl.appendChild(li);
      });
    }

    // Stats / Sparkline
    const sparkEl = document.getElementById('sparkline');
    const stats = await fetchJson('data/stats.json');
    if(sparkEl && stats && Array.isArray(stats.sparkline)){
      // Render a simple micro chart as bars
      sparkEl.innerHTML = '';
      const max = Math.max(...stats.sparkline, 1);
      stats.sparkline.forEach(v => {
        const bar = document.createElement('span');
        bar.className = 'spark-bar';
        const height = Math.round((v / max) * 100);
        bar.style.height = height + '%';
        sparkEl.appendChild(bar);
      });
    }
  }

  // Wire the refresh button specifically to re-load data
  const refreshStats = document.getElementById('refresh-stats');
  if(refreshStats){
    refreshStats.addEventListener('click', () => {
      refreshStats.animate([{ transform: 'rotate(0)'}, { transform: 'rotate(180deg)' }, { transform: 'rotate(360deg)' }], { duration: 400 });
      loadDashboardData();
    });
  }

  // Initial data load
  document.addEventListener('DOMContentLoaded', () => {
    // allow small delay for HTML to be parsed
    setTimeout(loadDashboardData, 60);
  });
})();
