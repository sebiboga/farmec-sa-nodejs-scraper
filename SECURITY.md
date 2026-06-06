# SECURITY.md — Politica de securitate

## Credentiale

1. **NU** hardcodăm credentiale (`SOLR_AUTH`, `SOLR_USER`, `SOLR_PASS`) în niciun fișier din repository.
2. Toate credentialele se citesc din variabile de mediu (`process.env.SOLR_AUTH`).
3. Fișierul `.env.local` (care conține `SOLR_AUTH (format: user:password)`) este listat în `.gitignore` și **NU** se comite niciodată.
4. În GitHub Actions, credentialele se transmit prin `secrets.SOLR_AUTH`.

## Raportarea vulnerabilităților

Dacă descoperi o vulnerabilitate, te rugăm să:
1. Creezi un Issue privat (dacă e posibil)
2. Sau să contactezi administratorul platformei peviitor.ro

## Istoric

- Toate repository-urile au trecut printr-un `git filter-branch` pentru a elimina orice credentiale hardcodate din istoric.
