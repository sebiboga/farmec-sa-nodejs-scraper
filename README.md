# FARMEC SA — Node.js Scraper

Scraper pentru job-urile postate de **FARMEC SA** în platforma [peviitor.ro](https://peviitor.ro).

## Sursa datelor

- Site oficial: `https://www.farmec.ro/compania/cariere/`
- eJobs: `https://www.ejobs.ro/company/farmec/176855`

## Tehnologii

- **Node.js** (v24+)
- **node-fetch** — request-uri HTTP
- **cheerio** — parsare HTML (dacă e necesar)
- **Jest** — testare

## Cum rulezi

```bash
npm install
node --no-deprecation index.js
```

## Teste

```bash
npm test
```

## Output

Job-urile sunt trimise direct în indexul SOLR al platformei peviitor.ro.

## Statut ANAF

Compania este validată automat prin API-ul ANAF la fiecare rulare.

## Maintainer

Repository administrat în cadrul platformei [peviitor.ro](https://peviitor.ro).
