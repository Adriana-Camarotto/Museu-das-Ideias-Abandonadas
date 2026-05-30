function setNav(el) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
  }
  function setFilter(el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }
  function selectEmoji(el) {
    document.querySelectorAll('.emoji-btn').forEach(e => e.classList.remove('sel'));
    el.classList.add('sel');
    // Update survival prediction randomly
    const pcts = [7, 13, 19, 31, 48];
    const idx = Array.from(document.querySelectorAll('.emoji-btn')).indexOf(el);
    const pct = pcts[idx] || 13;
    document.getElementById('survivalPct').textContent = pct + '%';
    document.querySelector('[style*="background:linear-gradient(90deg"]').style.width = pct + '%';
  }
  function updateCount(el) {
    const label = el.closest('.form-group').querySelector('.char-count');
    if (label) label.textContent = el.value.length + '/300';
    if (el.value.length > 300) el.value = el.value.slice(0, 300);
  }
  function openModal() {
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelector('.form-input').focus();
  }
  // Memorial tabs
  document.querySelectorAll('.mem-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.mem-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  // Rank tabs
  document.querySelectorAll('.rank-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  // Animate survival bar on load
  setTimeout(() => {
    const bar = document.querySelector('[style*="background:linear-gradient(90deg"]');
    if (bar) bar.style.width = '13%';
  }, 400);