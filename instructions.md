# instructions.md — Instrucțiuni de mentenanță

## Cum rulezi scraperul local

```bash
node --no-deprecation index.js
```

## Cum rulezi testele

```bash
npm test
```

## Cum rulezi un test anume

```bash
node --no-deprecation --experimental-vm-modules node_modules/jest/bin/jest.js tests/unit/company.test.js
```

## Cum resetezi cache-ul

Șterge fișierele din `tmp/` ca să forțezi re-validarea companiei:

```bash
Remove-Item -Recurse -Force tmp/
```

## Cum verifici job-urile în SOLR

`node validate-jobs.js <CIF>` — verifică URL-urile și șterge job-urile expirate.

## Credentiale

SOLR_AUTH se citește din `process.env.SOLR_AUTH`. Local, setează în `.env.local`:

```
SOLR_AUTH (format: user:password)
```

## Debug

Toate logurile sunt în consola standard. Nu există logging persistent.
