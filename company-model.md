# company-model.md — Modelul de date pentru o companie

O companie în SOLR company core respectă următoarea structură:

| Câmp | Tip | Obligatoriu | Descriere |
|------|-----|-------------|-----------|
| `id` | string | Da | CUI-ul companiei |
| `company` | string | Da | Numele legal al companiei |
| `brand` | string | Nu | Numele de brand |
| `group` | string | Nu | Grupul din care face parte |
| `status` | string | Nu | Status ANAF ("activ", "inactiv", "suspendat", "radiat") |
| `location` | array | Nu | Adresa completă |
| `website` | array | Nu | Site-uri web |
| `career` | array | Nu | Link-uri către cariere |
| `lastScraped` | string | Nu | Data ultimei scrape |
| `scraperFile` | string | Nu | Link către workflow-ul de scrape |

## Exemplu

```json
{
  "id": "199150",
  "company": "FARMEC SA",
  "brand": "FARMEC",
  "status": "activ",
  "location": ["Str. HENRI BARBUSSE, 16, Municipiul Cluj-Napoca, Cluj"],
  "website": ["https://www.farmec.ro"],
  "career": ["https://www.farmec.ro/compania/cariere/"],
  "lastScraped": "2025-01-01",
  "scraperFile": "https://raw.githubusercontent.com/sebiboga/farmec-sa-nodejs-scraper/main/.github/workflows/scrape.yml"
}
```
