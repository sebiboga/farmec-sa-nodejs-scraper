# ROBOTS.md — Reguli pentru roboți

## User-Agent

Toate request-urile HTTP făcute de acest scraper folosesc:

```
job_seeker_ro_spider
```

## Politica de acces

1. Respectăm `robots.txt` al site-urilor pe care le scraper-uim.
2. Nu suprasolicităm serverele — există delay-uri implicite între request-uri.
3. Nu scraper-uim date personale sau informații protejate.
4. Identificăm întotdeauna scraperul prin User-Agent-ul de mai sus.

## Domenii accesate

| Domeniu | Scop |
|---------|------|
| `www.farmec.ro` | Pagina de cariere |
| `www.ejobs.ro` | Anunțuri eJobs |
| `api.peviitor.ro` | Validare companie |
| `solr.peviitor.ro` | Indexare job-uri |
