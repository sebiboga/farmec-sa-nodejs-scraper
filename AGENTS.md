# AGENTS.md — Instrucțiuni pentru AI Agents

Acest fișier definește regulile după care lucrează AI-ul (GitHub Copilot, opencode, etc.) în acest repository.

## Reguli generale

1. Toate fișierele temporare (`company.json`, `jobs.json`, `jobs_existing.json`, `expired-jobs.json`, etc.) **MUST** fie în directorul `tmp/` — nu în rădăcina proiectului.
2. Orice cale hardcodată către `company.json`, `jobs.json`, `jobs_existing.json` în `.js` / `.yml` / `.test.js` **MUST** fie prefixată cu `tmp/`.
3. `fs.mkdirSync("tmp", { recursive: true })` trebuie apelat înainte de orice scriere în `tmp/`.
4. Credentialele SOLR (`SOLR_AUTH`) nu se hardcodează niciodată în cod; se citesc din `process.env.SOLR_AUTH`.
5. Fișierul `.env.local` conține `SOLR_AUTH` (format: `user:password`) și este listat în `.gitignore`.
6. Testele care fac mock la `node-fetch` **MUST** folosi `jest.unstable_mockModule`.
7. Testele care scriu `tmp/company.json` trebuie să apeleze `fs.mkdirSync("tmp", { recursive: true })` în `beforeAll`.
8. Orice modificare de cod trebuie asociată cu un Issue GitHub.
