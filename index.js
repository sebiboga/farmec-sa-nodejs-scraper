import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";
import { validateAndGetCompany } from "./company.js";
import { querySOLR, upsertJobs, upsertCompany } from "./solr.js";

const COMPANY_CIF = "199150";
const CAREERS_URL = "https://www.farmec.ro/compania/cariere/";
const EJOBS_URL = "https://www.ejobs.ro/company/farmec/176855";
const COMPANY_NAME = "FARMEC SA";

let COMPANY_NAME_UPPER = null;

function extractJobs(html) {
  const jobRegex = /<a href="https:\/\/www\.farmec\.ro\/compania\/joburi\/([^"]+)\/">([\s\S]*?)<\/a><\/div><div class="listbox-next"/g;
  const jobs = [];
  let match;

  while ((match = jobRegex.exec(html)) !== null) {
    const slug = match[1];
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    jobs.push({
      title,
      slug,
      url: `https://www.farmec.ro/compania/joburi/${slug}/`
    });
  }

  return jobs;
}

async function fetchCareersPage() {
  const res = await fetch(CAREERS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} for careers page`);
  }

  return await res.text();
}

function resolveNuxtRef(val, data) {
  if (val === null || val === undefined) return val;
  if (typeof val === "number") {
    const target = data[val];
    if (target === null || target === undefined) return val;
    if (typeof target === "string" || typeof target === "number" || typeof target === "boolean") return target;
    if (Array.isArray(target)) {
      if (target.length === 2 && typeof target[1] === "number") {
        const type = target[0];
        if (type === "Ref" || type === "Reactive" || type === "ShallowReactive") return resolveNuxtRef(target[1], data);
        if (type === "EmptyRef") return null;
      }
      return target.map(v => resolveNuxtRef(v, data)).filter(v => v !== null);
    }
    if (typeof target === "object") {
      const result = {};
      for (const [k, v] of Object.entries(target)) result[k] = resolveNuxtRef(v, data);
      return result;
    }
    return target;
  }
  if (Array.isArray(val)) {
    if (val.length === 2 && typeof val[1] === "number") {
      const type = val[0];
      if (type === "Ref" || type === "Reactive" || type === "ShallowReactive") return resolveNuxtRef(val[1], data);
      if (type === "EmptyRef") return null;
    }
    return val.map(v => resolveNuxtRef(v, data));
  }
  if (typeof val === "object") {
    const result = {};
    for (const [k, v] of Object.entries(val)) result[k] = resolveNuxtRef(v, data);
    return result;
  }
  return val;
}

function extractEJobs(html) {
  const match = html.match(/__NUXT_DATA__">(.*?)<\/script>/);
  if (!match) return [];

  const data = JSON.parse(match[1]);
  const jobs = [];

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (typeof d === "object" && !Array.isArray(d) && d !== null && d.title !== undefined) {
      const resolved = resolveNuxtRef(d, data);
      if (resolved.id && resolved.title) {
        const slug = resolved.slug || "";
        jobs.push({
          title: resolved.title,
          department: "eJobs",
          url: slug ? `https://www.ejobs.ro/user/locuri-de-munca/${slug}/${resolved.id}` : ""
        });
      }
    }
  }

  return jobs;
}

async function fetchEJobsPage() {
  const res = await fetch(EJOBS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} for eJobs page`);
  }

  return await res.text();
}

function mapToJobModel(rawJob, cif, companyName) {
  const now = new Date().toISOString();

  const job = {
    url: rawJob.url,
    title: rawJob.title,
    company: companyName,
    cif: cif,
    location: ["Cluj-Napoca"],
    country: ["România"],
    date: now,
    status: "scraped"
  };

  Object.keys(job).forEach((k) => job[k] === undefined && delete job[k]);

  return job;
}

async function main() {
  try {
    console.log("=== Step 1: Get existing jobs count ===");
    const existingResult = await querySOLR(COMPANY_CIF);
    const existingCount = existingResult.numFound;
    console.log(`Found ${existingCount} existing jobs in SOLR`);

    console.log("=== Step 2: Validate company via ANAF ===");
    const { company, cif, address } = await validateAndGetCompany();
    COMPANY_NAME_UPPER = company;
    const localCif = cif;

    try {
      await upsertCompany({
        id: cif,
        company,
        brand: "FARMEC",
        status: "activ",
        location: address ? [address] : ["Cluj-Napoca"],
        website: ["https://www.farmec.ro"],
        career: ["https://www.farmec.ro/compania/cariere/"],
        lastScraped: new Date().toISOString().split('T')[0],
        scraperFile: "https://raw.githubusercontent.com/sebiboga/farmec-sa-nodejs-scraper/main/.github/workflows/scrape.yml"
      });
    } catch (err) {
      console.log(`Note: Could not upsert company to SOLR core: ${err.message}`);
    }

    console.log("=== Step 3: Scrape jobs from Farmec website ===");
    const farmecHtml = await fetchCareersPage();
    const farmecJobs = extractJobs(farmecHtml);
    console.log(`Found ${farmecJobs.length} jobs from Farmec website`);
    farmecJobs.forEach((j, i) => console.log(`  ${i + 1}. ${j.title}`));

    console.log("\n=== Step 4: Scrape jobs from eJobs ===");
    let ejobsJobs = [];
    try {
      const ejobsHtml = await fetchEJobsPage();
      ejobsJobs = extractEJobs(ejobsHtml);
    } catch (err) {
      console.log(`Note: Could not scrape eJobs: ${err.message}`);
    }
    console.log(`Found ${ejobsJobs.length} jobs from eJobs`);
    ejobsJobs.forEach((j, i) => console.log(`  ${i + 1}. ${j.title}`));

    console.log("\n=== Step 5: Merge and deduplicate jobs ===");
    const seenTitles = new Set();
    const allJobs = [];

    for (const job of [...farmecJobs, ...ejobsJobs]) {
      const key = job.title.toLowerCase().trim();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        allJobs.push(job);
      }
    }

    console.log(`Total after dedup: ${allJobs.length} jobs`);
    allJobs.forEach((j, i) => console.log(`  ${i + 1}. ${j.title}`));

    const mappedJobs = allJobs.map(job => mapToJobModel(job, localCif, COMPANY_NAME));

    const payload = {
      source: "www.farmec.ro, ejobs.ro",
      scrapedAt: new Date().toISOString(),
      company: COMPANY_NAME,
      cif: localCif,
      jobs: mappedJobs
    };

    console.log(`\n📊 Jobs count: ${payload.jobs.length}`);

    fs.writeFileSync("jobs.json", JSON.stringify(payload, null, 2), "utf-8");
    console.log("Saved jobs.json");

    console.log("\n=== Step 6: Upsert jobs to SOLR ===");
    await upsertJobs(payload.jobs);

    const finalResult = await querySOLR(COMPANY_CIF);
    console.log(`\n📊 === SUMMARY ===`);
    console.log(`📊 Jobs existing in SOLR before scrape: ${existingCount}`);
    console.log(`📊 Jobs scraped total: ${allJobs.length} (${farmecJobs.length} from website, ${ejobsJobs.length} from eJobs)`);
    console.log(`📊 Jobs in SOLR after scrape: ${finalResult.numFound}`);
    console.log(`====================`);

    console.log("\n=== DONE ===");
    console.log("Scraper completed successfully!");
  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
}

export { extractJobs, extractEJobs, mapToJobModel };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
