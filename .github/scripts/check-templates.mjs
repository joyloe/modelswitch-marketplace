/**
 * check-templates.mjs
 *
 * Reads templates.json, checks each template's /v1/models endpoint,
 * updates the models list, and writes the file back.
 * Designed to run in GitHub Actions (Node 22, no dependencies).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesPath = join(__dirname, "..", "..", "templates.json");

const templates = JSON.parse(readFileSync(templatesPath, "utf-8"));

async function checkTemplate(template) {
  const url = template.base_url.replace(/\/+$/, "") + "/models";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer test", "User-Agent": "ModelSwitch-bot/1.0" },
      signal: controller.signal,
    });

    if (resp.ok) {
      const json = await resp.json();
      if (json.data && Array.isArray(json.data)) {
        const models = json.data
          .map((m) => m.id || m.name)
          .filter(Boolean);
        if (models.length > 0) {
          template.models = models;
        }
      }
      template.status = "alive";
    } else if (resp.status === 401 || resp.status === 403) {
      template.status = "alive";
    } else {
      template.status = "degraded";
    }
  } catch {
    template.status = "down";
  } finally {
    clearTimeout(timeout);
  }

  template.last_checked = new Date().toISOString();
}

console.log(`Checking ${templates.length} templates...`);

for (const t of templates) {
  process.stdout.write(`  ${t.id} ... `);
  await checkTemplate(t);
  console.log(`${t.status}`);
}

templates.sort((a, b) => a.id.localeCompare(b.id));

writeFileSync(templatesPath, JSON.stringify(templates, null, 2) + "\n", "utf-8");

const alive = templates.filter((t) => t.status === "alive").length;
const down = templates.filter((t) => t.status === "down").length;
console.log(`Done: ${alive} alive, ${down} down, ${templates.length} total`);
