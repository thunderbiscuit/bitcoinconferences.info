// ── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date();
today.setHours(0, 0, 0, 0);

function isPast(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d) < today;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function groupByYear(list) {
  const map = {};
  for (const conf of list) {
    const year = conf.date.slice(0, 4);
    (map[year] ??= []).push(conf);
  }
  return map;
}

// ── Rendering ────────────────────────────────────────────────────────────────

function buildRow(conf, isNext, dimIfPast = true) {
  const past = isPast(conf.date);
  const a = document.createElement('a');
  a.href = conf.link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'conf-row' + (past && dimIfPast ? ' past' : '');

  const nextBadge = isNext ? '<span class="next-badge">NEXT</span>' : '';

  a.innerHTML = `
    <span class="conf-date">${formatDate(conf.date)}</span>
    <span class="conf-name">${conf.title}${nextBadge}</span>
    <span class="conf-location">${conf.flag}&nbsp;${conf.location}</span>
  `;
  return a;
}

function render(conferences, { dimPast = true, emptyMsg = 'No conferences found.' } = {}) {
  const list = document.getElementById('list');
  list.innerHTML = '';

  if (conferences.length === 0) {
    list.innerHTML = `<p class="empty-state">${emptyMsg}</p>`;
    return;
  }

  const sorted = [...conferences].sort((a, b) => a.date.localeCompare(b.date));
  const grouped = groupByYear(sorted);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  const nextConf = sorted.find(c => !isPast(c.date));

  for (const year of years) {
    const section = document.createElement('section');
    section.className = 'year-section';

    const count = grouped[year].length;
    section.innerHTML = `
      <div class="year-header">
        <span class="year-label">${year}</span>
        <span class="year-count">${count} conference${count !== 1 ? 's' : ''}</span>
      </div>
    `;

    for (const conf of grouped[year]) {
      section.appendChild(buildRow(conf, conf === nextConf, dimPast));
    }

    list.appendChild(section);
  }
}

// ── Filters ──────────────────────────────────────────────────────────────────

function showUpcoming() {
  document.getElementById('btn-upcoming').classList.add('active');
  document.getElementById('btn-past').classList.remove('active');
  render(CONFERENCES.filter(c => !isPast(c.date)));
}

function showPast() {
  document.getElementById('btn-past').classList.add('active');
  document.getElementById('btn-upcoming').classList.remove('active');
  render(CONFERENCES.filter(c => isPast(c.date)), { dimPast: false, emptyMsg: 'No past conferences.' });
}

document.getElementById('btn-upcoming').addEventListener('click', showUpcoming);
document.getElementById('btn-past').addEventListener('click', showPast);

// ── Bootstrap ────────────────────────────────────────────────────────────────

showUpcoming();
