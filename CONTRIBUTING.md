# CONTRIBUTING.md — Cum să contribui

## Proces

1. Creează un Issue pentru orice modificare.
2. Fă modificările pe un branch nou.
3. Asigură-te că testele trec: `npm test`.
4. Creează un Pull Request către `main`.
5. După merge, închide Issue-ul.

## Reguli de cod

- Folosește `jest.unstable_mockModule` pentru mock-uri, nu `jest.mock`.
- Toate căile temporare (`company.json`, `jobs.json`, etc.) trebuie să fie în `tmp/`.
- Credentialele se citesc din `process.env.SOLR_AUTH`, nu se hardcodează.
- Mesajele de commit trebuie să includă numărul Issue-ului: `"Descriere (#123)"`.

## Testare

Rulează testele înainte de orice PR:

```bash
npm test
```

Testele unitare trebuie să treacă toate. Testele de integrare/e2e pot necesita credentiale SOLR reale.
