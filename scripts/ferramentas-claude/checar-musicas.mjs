// Confere a biblioteca de músicas desta conta (public/musicas):
// - nenhuma faixa igual às de outra conta do grupo (musicas-do-grupo.json, por SHA-256)
// - nenhuma faixa repetida dentro da própria pasta
// - toda faixa registrada no CREDITOS.txt (de onde veio e qual a licença)
// Uso: node scripts/ferramentas-claude/checar-musicas.mjs            -> confere (sai com código 1 se houver problema)
//      node scripts/ferramentas-claude/checar-musicas.mjs --hashes   -> imprime as faixas desta conta para acrescentar em musicas-do-grupo.json
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const pasta = path.join(raiz, "public", "musicas");
const grupo = JSON.parse(fs.readFileSync(path.join(raiz, "scripts", "ferramentas-claude", "musicas-do-grupo.json"), "utf8")).faixas;
const conta = JSON.parse(fs.readFileSync(path.join(raiz, "conta.json"), "utf8"));
const creditos = fs.existsSync(path.join(pasta, "CREDITOS.txt")) ? fs.readFileSync(path.join(pasta, "CREDITOS.txt"), "utf8") : "";

const faixas = fs.readdirSync(pasta).filter((f) => /\.(mp3|wav|m4a)$/i.test(f))
  .map((f) => ({ arquivo: f, sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(pasta, f))).digest("hex") }));

if (process.argv.includes("--hashes")) {
  console.log(JSON.stringify(faixas.map(({ sha256 }) => ({ sha256, conta: conta.nome || "?" })), null, 2));
  process.exit(0);
}

const problemas = [];
const vistos = new Map();
for (const f of faixas) {
  if (grupo.some((g) => g.sha256 === f.sha256)) problemas.push(`${f.arquivo}: já é usada em outra conta do grupo — apagar e escolher outra`);
  if (vistos.has(f.sha256)) problemas.push(`${f.arquivo}: é a mesma faixa que ${vistos.get(f.sha256)}`);
  vistos.set(f.sha256, f.arquivo);
  if (!creditos.includes(f.arquivo)) problemas.push(`${f.arquivo}: falta no CREDITOS.txt (link, autor e licença)`);
}
const estilos = {};
for (const f of faixas) { const e = f.arquivo.replace(/(-\d+)?\.\w+$/, ""); estilos[e] = (estilos[e] || 0) + 1; }

console.log(`${faixas.length} música(s) em public/musicas${faixas.length ? ": " + Object.entries(estilos).map(([e, n]) => `${e} (${n})`).join(", ") : ""}`);
if (faixas.length < 10) console.log("⚠ Biblioteca pequena: o ideal são 15–20 faixas de estilos variados.");
if (problemas.length) { console.log("PROBLEMAS:"); for (const p of problemas) console.log(" - " + p); process.exit(1); }
console.log("Tudo certo.");
