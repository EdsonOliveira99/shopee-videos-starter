// Versão INSTAGRAM dos vídeos: mesma edição, mas sem "toca no carrinho".
// - corta a narração original antes do "Toca no carrinho..." (usa os tempos de cada letra do ElevenLabs)
// - toca no lugar uma frase final única ("Comenta EU QUERO..."), gerada UMA vez só (não gasta créditos por vídeo)
// - troca o texto da tela final e escreve legenda própria para o Instagram
// Saída: VIDEOS-INSTAGRAM/DD-MM-AAAA/N-HHhMM-slug.mp4 + .txt (legenda) + 00-POSTAGEM-INSTAGRAM.txt + postagens.json
// Uso: node scripts/v2/instagram.mjs            (vídeos com postagem de hoje em diante)
//      node scripts/v2/instagram.mjs --teste    (só mostra o que faria)
//      node scripts/v2/instagram.mjs garrafa-termica   (só esse)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, "scripts", "v2", "config.json"), "utf8")).instagram;
const voz = JSON.parse(fs.readFileSync(path.join(raiz, "conta.json"), "utf8")).voz?.id;
const TESTE = process.argv.includes("--teste");
const so = process.argv.slice(2).find((a) => !a.startsWith("--"));
const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const hoje = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pastaDia = (iso) => iso.split("-").reverse().join("-");
const pastaSaida = path.join(raiz, cfg.pasta || "VIDEOS-INSTAGRAM");

// 1) frase final (uma vez só)
const finalRel = "instagram/final-eu-quero.mp3";
const finalAbs = path.join(raiz, "public", finalRel);
if (!fs.existsSync(finalAbs) && !TESTE) {
  const chave = fs.readFileSync(path.join(raiz, "CHAVE-ELEVENLABS.txt"), "utf8").replace(/^﻿/, "").trim();
  console.log("Gerando a frase final do Instagram (uma vez só)...");
  let ok = false;
  for (const modelo of ["eleven_v3", "eleven_multilingual_v2"]) {
    const texto = modelo === "eleven_v3" ? cfg.fraseFinal : cfg.fraseFinal.replace(/\[[^\]]+\]\s*/g, "");
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}?output_format=mp3_44100_128`, {
      method: "POST", headers: { "xi-api-key": chave, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texto, model_id: modelo }),
    });
    if (r.ok) { fs.mkdirSync(path.dirname(finalAbs), { recursive: true }); fs.writeFileSync(finalAbs, Buffer.from(await r.arrayBuffer())); ok = true; break; }
    console.log(`  falhou com ${modelo}: ${r.status}`);
  }
  if (!ok) { console.error("Não consegui gerar a frase final. Nada foi feito."); process.exit(1); }
}

// 2) monta as versões
const todos = fs.readdirSync(path.join(raiz, "produtos")).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(raiz, "produtos", f), "utf8")))
  .filter((p) => (so ? p.slug === so : (p.postar || hoje) >= hoje));

const corte = (p) => {
  const arq = path.join(raiz, "public", p.narracao.replace(/\.mp3$/, ".tempos.json"));
  if (!fs.existsSync(arq)) return null;
  const t = JSON.parse(fs.readFileSync(arq, "utf8"));
  const txt = t.characters.join("");
  const m = /(\[[^\]]*\]\s*)?(Toca|Toque|Clica|Clique) (no|aqui no) carrinho/i.exec(txt);
  if (!m) return null;
  // fim da última letra falada antes do "toca no carrinho"
  let j = m.index - 1;
  while (j > 0 && /\s/.test(txt[j])) j--;
  return Math.min(t.character_end_times_seconds[j] + 0.15, t.character_start_times_seconds[m.index]);
};

const semHashtag = (s) => (s || "").replace(/#\S+/g, "").replace(/\s+/g, " ").trim();
const legendaIG = (p) => `${semHashtag(p.legenda)}\n\n💬 Comenta "${cfg.palavraChave}" que eu te mando o link no direct!\n🔗 Ou pega no link da bio.\n\n${(p.legenda.match(/#\S+/g) || []).filter((h) => h !== "#achadinhosshopee").join(" ")} ${cfg.hashtags}`.trim();

const fila = [], pulados = [];
const porData = {};
for (const p of todos) {
  if (!p.narracao || !fs.existsSync(path.join(raiz, "public", p.narracao))) { pulados.push(`${p.slug} (sem narração ainda)`); continue; }
  const ate = corte(p);
  if (ate == null) { pulados.push(`${p.slug} (não achei "toca no carrinho" na narração)`); continue; }
  const ig = { ...p, narracaoAte: Number(ate.toFixed(2)), narracaoFinal: finalRel, cta: cfg.ctaTela, legendaInstagram: legendaIG(p) };
  (porData[p.postar || hoje] ??= []).push(ig);
}
for (const [data, lista] of Object.entries(porData)) {
  lista.sort((a, b) => (a.horario || "99").localeCompare(b.horario || "99"));
  const dir = path.join(pastaSaida, pastaDia(data));
  if (!TESTE) fs.mkdirSync(dir, { recursive: true });
  const linhas = [`INSTAGRAM — POSTAGENS DE ${pastaDia(data).replace(/-/g, "/")}`, ""];
  const manifesto = [];
  lista.forEach((p, i) => {
    const base = [i + 1, p.horario && p.horario.replace(":", "h"), p.slug].filter(Boolean).join("-");
    p._saida = path.join(dir, `${base}.mp4`);
    linhas.push(`VÍDEO ${i + 1}  [${p.horario || "--:--"}]  ${base}.mp4`, `Produto: ${p.produtoNome || p.nomeProduto}`);
    if (p.itemId && p.lojaId) linhas.push(`Link do produto: https://shopee.com.br/product/${p.lojaId}/${p.itemId}`);
    linhas.push("Legenda:", p.legendaInstagram, "");
    manifesto.push({ arquivo: `${base}.mp4`, data, horario: p.horario || null, slug: p.slug, legenda: p.legendaInstagram, itemId: p.itemId || null, lojaId: p.lojaId || null });
    if (!TESTE) fs.writeFileSync(path.join(dir, `${base}.txt`), p.legendaInstagram, "utf8");
    if (!fs.existsSync(p._saida)) fila.push(p);
  });
  if (!TESTE) {
    fs.writeFileSync(path.join(dir, "00-POSTAGEM-INSTAGRAM.txt"), linhas.join("\r\n"), "utf8");
    fs.writeFileSync(path.join(dir, "postagens.json"), JSON.stringify(manifesto, null, 2), "utf8");
  }
}
if (pulados.length) console.log(`⚠ Pulados: ${pulados.join("; ")}`);
console.log(`Instagram: ${fila.length} vídeo(s) para renderizar.`);
if (TESTE) { for (const p of fila) console.log(`  ${p.slug}: corta em ${p.narracaoAte}s -> ${path.relative(raiz, p._saida)}`); process.exit(0); }
if (!fila.length) process.exit(0);

// 3) render (mesma composição do vídeo da Shopee, com as propriedades trocadas)
const { bundle } = await import("@remotion/bundler");
const { renderMedia, selectComposition } = await import("@remotion/renderer");
console.log("Preparando o projeto (bundle)...");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src", "index.ts") });
for (const ig of fila) {
  const { _saida, legendaInstagram, ...inputProps } = ig;
  const comp = await selectComposition({ serveUrl, id: ig.slug, inputProps });
  console.log(`\n▶ IG ${ig.slug}  (${(comp.durationInFrames / comp.fps).toFixed(1)}s)`);
  let ultimo = -1; const ti = Date.now();
  await renderMedia({ composition: comp, serveUrl, codec: "h264", crf: 23, outputLocation: _saida, inputProps,
    concurrency: Math.max(1, Math.floor(os.cpus().length / 2)),
    onProgress: ({ progress }) => { const q = Math.floor(progress * 100); if (q % 20 === 0 && q !== ultimo) { ultimo = q; process.stdout.write(`  ${q}%`); } } });
  console.log(`\n✔ salvo — ${((Date.now() - ti) / 1000).toFixed(0)} s`);
}
console.log(`\nPronto! ${fila.length} vídeo(s) do Instagram.`);
