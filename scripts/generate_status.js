const fs = require('fs');

const SITES = [
  { name: "Main Portfolio",       url: "https://hamednouri.com",               category: "Main"      },
  { name: "Hub",                  url: "https://hub.hamednouri.com",            category: "Main"      },
  { name: "Delivery",             url: "https://delivery.hamednouri.com",       category: "Portfolio" },
  { name: "Learning",             url: "https://learning.hamednouri.com",       category: "Portfolio" },
  { name: "Writing",              url: "https://writing.hamednouri.com",        category: "Portfolio" },
  { name: "Growth",               url: "https://growth.hamednouri.com",         category: "Portfolio" },
  { name: "Web",                  url: "https://web.hamednouri.com",            category: "Portfolio" },
  { name: "Books",                url: "https://books.hamednouri.com",          category: "Portfolio" },
  { name: "Author",               url: "https://author.hamednouri.com",         category: "Portfolio" },
  { name: "Voice",                url: "https://voice.hamednouri.com",          category: "Portfolio" },
  { name: "Video",                url: "https://video.hamednouri.com",          category: "Portfolio" },
  { name: "Photo",                url: "https://photo.hamednouri.com",          category: "Portfolio" },
  { name: "AI",                   url: "https://ai.hamednouri.com",             category: "Portfolio" },
  { name: "Mindful",              url: "https://mindful.hamednouri.com",        category: "Portfolio" },
  { name: "Systems",              url: "https://systems.hamednouri.com",        category: "Portfolio" },
  { name: "Resume",               url: "https://resume.hamednouri.com",         category: "Portfolio" },
  { name: "Solutions",            url: "https://solutions.hamednouri.com",      category: "Portfolio" },
  { name: "Japanese Solutions",   url: "https://jp.hamednouri.com/solutions",   category: "Portfolio" },
  { name: "JP Solutions Alias",   url: "https://jp-solutions.hamednouri.com",   category: "Portfolio" },
];

const TIMEOUT_MS = 6000;

async function checkSite(site) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(site.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "hamednouri-hub-status-checker/1.0" }
    });

    const responseMs = Date.now() - started;
    clearTimeout(timer);

    let status = "unknown";
    if      (response.status >= 200 && response.status <= 299) status = "live";
    else if (response.status >= 300 && response.status <= 399) status = "redirecting";
    else if (response.status >= 400 && response.status <= 499) status = "warning";
    else if (response.status >= 500)                           status = "down";

    if (status === "live" && responseMs > 3000) status = "slow";

    return {
      name:       site.name,
      url:        site.url,
      category:   site.category,
      status,
      httpStatus: response.status,
      responseMs,
      finalUrl:   response.url,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      name:       site.name,
      url:        site.url,
      category:   site.category,
      status:     "down",
      httpStatus: null,
      responseMs: Date.now() - started,
      error:      err && err.message ? err.message : String(err),
    };
  }
}

async function main() {
  console.log("Starting status check...");
  const checkedAt = new Date().toISOString();
  const results = await Promise.all(SITES.map(checkSite));
  
  const output = {
    checkedAt,
    sites: results
  };

  fs.writeFileSync('status.json', JSON.stringify(output, null, 2));
  console.log("Status check complete. Wrote to status.json");
}

main().catch(console.error);
