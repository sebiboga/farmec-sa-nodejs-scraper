# files.md — Fișierele din acest repository

## Fișiere obligatorii (template)

| Fișier | Obligatoriu | Descriere |
|--------|-------------|-----------|
| `README.md` | Da | Prezentare generală a scraperului |
| `AGENTS.md` | Da | Instrucțiuni pentru AI agents |
| `BRANCH.md` | Da | Regula branch-ului default (`main`) |
| `PUBLIC.md` | Da | Regula vizibilității publice |
| `TOPICS.md` | Da | Regula topic-urilor GitHub |
| `ISSUES.md` | Da | Regula pentru GitHub Issues |
| `SECURITY.md` | Da | Politica de securitate |
| `ROBOTS.md` | Da | Reguli pentru roboți |
| `CONTRIBUTING.md` | Da | Cum să contribui |
| `files.md` | Da | Acest fișier — lista completă de fișiere |
| `instructions.md` | Da | Instrucțiuni detaliate de mentenanță |
| `job-model.md` | Da | Modelul de date pentru un job |
| `company-model.md` | Da | Modelul de date pentru o companie |
| `UPDATE-REPO-ABOUT.md` | Da | Cum se actualizează descrierea/topic-urile |
| `docs/README.md` | Da | Documentație pagină GitHub Pages |

## Cod sursă

| Fișier | Rol |
|--------|-----|
| `index.js` | Entry point — orchestrează scraperul |
| `company.js` | Validare companie via ANAF + cache |
| `solr.js` | Interacțiune cu indexul SOLR |
| `src/anaf.js` | Interogare API ANAF |
| `validate-jobs.js` | Script de validare/curățare job-uri |

## Teste

| Fișier | Tip |
|--------|-----|
| `tests/unit/company.test.js` | Test unitar pentru company.js |
| `tests/unit/index.test.js` | Test unitar pentru index.js |
| `tests/unit/solr.test.js` | Test unitar pentru solr.js |
| `tests/unit/demoanaf.test.js` | Test unitar pentru ANAF |
| `tests/unit/public.test.js` | Test vizibilitate publică |
| `tests/unit/topics.test.js` | Test topic-uri GitHub |
| `tests/integration/workflow.test.js` | Test integrare |
| `tests/e2e/scraper.test.js` | Test end-to-end |
| `tests/validate-farmec-jobs.js` | Script validare job-uri |
