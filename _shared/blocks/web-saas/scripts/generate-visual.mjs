// generate-visual.mjs — génère un visuel on-brand via Nano Banana Pro (Gemini image).
//
// Le moteur de VISUELS du plugin (`providers.visuals = "nano-banana"`). À utiliser à
// l'étape design/build quand un visuel CUSTOM sert le design (hero, illustration,
// empty-state, OG image, spot art) — jamais du stock générique ni un placeholder.
// La clé vit dans `~/.saas-factory/.env` (GEMINI_API_KEY) — jamais en dur, jamais commitée.
//
// Usage :
//   GEMINI_API_KEY=... node scripts/generate-visual.mjs "<prompt>" <out.png> [model] [aspect]
//   node scripts/generate-visual.mjs "editorial hero for a B2B agency portal, dark ink + warm accent, no text" public/hero.png
//
// Modèles (2026) : gemini-3-pro-image (Nano Banana PRO — défaut, meilleur rendu + texte),
//   gemini-3.1-flash-image (rapide/moins cher), gemini-2.5-flash-image (Nano Banana v1).
//
// BONNE PRATIQUE PROMPT (anti-slop, distinctif) : dérive le prompt de la DIRECTION DESIGN du
// projet (DESIGN.md : palette de marque, typo, parti-pris, métier) — pas un prompt générique.
// Précise : le sujet, le style (éditorial/premium/…), la PALETTE (couleurs de la marque), le
// cadrage/format, « NO lorem text / NO logos » si besoin, l'aspect. Deux projets de métiers
// différents → prompts différents → visuels différents (c'est l'anti-convergence côté image).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [, , prompt, out, model = "gemini-3-pro-image", aspect = "16:9"] = process.argv;
const KEY = process.env.GEMINI_API_KEY;

function die(msg) {
  console.error("✗ generate-visual: " + msg);
  process.exit(1);
}
if (!KEY) die("GEMINI_API_KEY absente (déposer dans ~/.saas-factory/.env).");
if (!prompt || !out) die('usage: node scripts/generate-visual.mjs "<prompt>" <out.png> [model] [aspect]');

const fullPrompt = `${prompt}\n\n(Aspect ratio ${aspect}. High quality, crisp, production-ready web asset.)`;

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  },
);

if (!res.ok) die(`HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
const data = await res.json();
if (data.error) die(JSON.stringify(data.error).slice(0, 300));

const parts = data.candidates?.[0]?.content?.parts ?? [];
const img = parts.find((p) => p.inlineData || p.inline_data);
if (!img) die("aucune image dans la réponse — " + JSON.stringify(parts).slice(0, 200));

const buf = Buffer.from((img.inlineData || img.inline_data).data, "base64");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buf);
console.log(`✓ visuel généré : ${out} (${Math.round(buf.length / 1024)} KB, ${model})`);
