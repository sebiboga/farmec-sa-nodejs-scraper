# UPDATE-REPO-ABOUT.md — Cum se actualizează descrierea și topic-urile

## Descriere

```bash
gh repo edit sebiboga/farmec-sa-nodejs-scraper --description "web scraper pentru a aduce locurile de munca de la FARMEC SA in platforma peviitor.ro"
```

## Topic-uri

```bash
gh repo edit sebiboga/farmec-sa-nodejs-scraper --add-topic job-seeker-ro-spider --add-topic peviitor-ro
```

## Verificare

```bash
gh repo view sebiboga/farmec-sa-nodejs-scraper --json description,repositoryTopics
```
