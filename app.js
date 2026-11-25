const PROGRAMS = [
  {
    id: 'cloud-devops',
    category: 'cloud',
    tag: 'Cloud & DevOps',
    title: 'Cloud Infrastructure & Kubernetes',
    desc: 'Design multi-region VPCs, Terraform modules, Docker pipelines, and production Kubernetes clusters.',
    meta: '12 Weeks · Intermediate',
  },
  {
    id: 'ai-engineering',
    category: 'ai',
    tag: 'AI & Data',
    title: 'Applied AI & RAG Systems',
    desc: 'Build evaluation-driven LLM workflows, vector retrieval, tool-calling agents, and inference APIs.',
    meta: '10 Weeks · Intermediate',
  },
  {
    id: 'soc-cybersecurity',
    category: 'security',
    tag: 'Cybersecurity',
    title: 'Cloud Security & Zero-Trust Ops',
    desc: 'Harden IAM policies, automate SIEM alerting, run threat modeling, and manage incident response.',
    meta: '10 Weeks · All Levels',
  },
  {
    id: 'fullstack-ts',
    category: 'engineering',
    tag: 'Software Engineering',
    title: 'TypeScript, React & Distributed APIs',
    desc: 'Ship resilient web applications with strict TypeScript, PostgreSQL/MongoDB, queues, and observability.',
    meta: '14 Weeks · Beginner–Pro',
  },
  {
    id: 'sre-observability',
    category: 'cloud',
    tag: 'Cloud & DevOps',
    title: 'Site Reliability & Observability',
    desc: 'Master Prometheus, Grafana, OpenTelemetry tracing, SLO error budgets, and chaos testing.',
    meta: '8 Weeks · Advanced',
  },
  {
    id: 'data-platform',
    category: 'ai',
    tag: 'AI & Data',
    title: 'Modern Data Pipelines & Lakehouse',
    desc: 'Architect streaming ingestion, dbt transformations, warehouse governance, and analytics APIs.',
    meta: '10 Weeks · Intermediate',
  },
];

const cardsEl = document.getElementById('programCards');
const filterBtns = document.querySelectorAll('.filter-btn');
const modalEl = document.getElementById('enrollModal');
const trackInput = document.getElementById('trackInput');
const closeBtn = document.getElementById('closeModal');
const formEl = document.getElementById('enrollForm');
const statusEl = document.getElementById('formStatus');

function renderCards(filter = 'all') {
  const list = filter === 'all' ? PROGRAMS : PROGRAMS.filter((p) => p.category === filter);
  cardsEl.innerHTML = list
    .map(
      (p) => `
      <article class="card">
        <div>
          <span class="card-tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
        </div>
        <div class="card-foot">
          <span>${p.meta}</span>
          <button type="button" class="btn btn-outline" data-open-enroll="${p.title}">Apply</button>
        </div>
      </article>`,
    )
    .join('');

  cardsEl.querySelectorAll('[data-open-enroll]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-enroll')));
  });
}

function openModal(trackName) {
  trackInput.value = trackName || 'General Inquiry';
  statusEl.textContent = '';
  modalEl.hidden = false;
}

function closeModal() {
  modalEl.hidden = true;
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.getAttribute('data-filter'));
  });
});

document.querySelectorAll('[data-open-enroll]').forEach((btn) => {
  btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-enroll')));
});

closeBtn.addEventListener('click', closeModal);
modalEl.addEventListener('click', (e) => {
  if (e.target === modalEl) closeModal();
});

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(formEl);
  statusEl.textContent = `Request received for ${data.get('track')}. Our team will email ${data.get('email')}.`;
  formEl.reset();
});

renderCards('all');
