// FAZER-TUDO: narração (com novas tentativas) -> render -> conferência -> cópia p/ Google Drive -> limpeza.
// Não altera os scripts antigos: só chama scripts/gerar-narracoes.mjs e scripts/render-todos.mjs.
// Uso: node scripts/v2/fazer-tudo.mjs          (normal)
//      node scripts/v2/fazer-tudo.mjs --teste  (só confere e mostra o que faria, sem gerar/renderizar/copiar/apagar)
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, "scripts", "v2", "config.json"), "utf8"));
const expandir = (p) => p.replace(/%([^%]+)%/g, (_, v) => process.env[v] ?? "");
const TESTE = process.argv.includes("--teste");

const pad = (n) => String(n).padStart(2, "0");
const agora = new Date();
const hojeISO = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
const carimbo = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };

const pastaLogs = path.join(raiz, "logs");
fs.mkdirSync(pastaLogs, { recursive: true });
const arqLog = path.join(pastaLogs, `fazer-tudo-${hojeISO}.log`);
const log = (msg) => { const l = `[${carimbo()}] ${msg}`; console.log(l); fs.appendFileSync(arqLog, l + "\r\n", "utf8"); };
const problemas = [];

const rodar = (rotulo, script, args = []) => new Promise((ok) => {
  log(`>> ${rotulo}`);
  // mostra a saída AO VIVO na janela e grava no log ao mesmo tempo
  const pr = spawn(process.execPath, [path.join(raiz, script), ...args], { cwd: raiz });
  const fwd = (d) => { process.stdout.write(d); fs.appendFileSync(arqLog, String(d).replace(/\r?\n/g, "\r\n"), "utf8"); };
  pr.stdout.on("data", fwd); pr.stderr.on("data", fwd);
  pr.on("close", (code) => { if (code !== 0) log(`!! ${rotulo} terminou com erro (código ${code})`); ok(code === 0); });
});

const carregar = () => fs.readdirSync(path.join(raiz, "produtos")).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(raiz, "produtos", f), "utf8")));
// só interessa o que é de hoje em diante
const ativos = () => carregar().filter((p) => !p.postar || p.postar >= hojeISO);
const semNarracao = () => ativos().filter((p) => p.narracao && !fs.existsSync(path.join(raiz, "public", p.narracao)));
const pastaDia = (iso) => iso.split("-").reverse().join("-");

log(`===== FAZER-TUDO ${TESTE ? "(TESTE) " : ""}— ${hojeISO} =====`);
log(`${ativos().length} vídeo(s) com postagem de hoje em diante`);

// 1) Narrações, com novas tentativas
let faltam = semNarracao();
for (let t = 1; faltam.length && t <= cfg.tentativasNarracao; t++) {
  log(`Narrações faltando: ${faltam.length} (tentativa ${t}/${cfg.tentativasNarracao})`);
  if (TESTE) break;
  await rodar("Gerar narrações", "scripts/gerar-narracoes.mjs");
  faltam = semNarracao();
  if (faltam.length && t < cfg.tentativasNarracao) { log("Esperando 60 s para tentar de novo..."); spawnSync(process.execPath, ["-e", "setTimeout(()=>{},60000)"]); }
}
if (faltam.length) problemas.push(`Sem narração (NÃO renderizados): ${faltam.map((p) => p.slug).join(", ")}`);

// 2) Render (o render-todos já pula quem não tem narração e quem já foi renderizado)
if (!TESTE) await rodar("Renderizar", "scripts/render-todos.mjs");

// 2b) Versão Instagram (mesmos vídeos, final "Comenta EU QUERO")
if (!TESTE && cfg.instagram?.ativo) await rodar("Versão Instagram", "scripts/v2/instagram.mjs");

// 3) Conferência: cada vídeo ativo com narração tem o .mp4 na pasta do dia?
const naoRenderizados = [];
for (const p of ativos()) {
  if (faltam.includes(p)) continue;
  const dir = path.join(raiz, "VIDEOS-PRONTOS", pastaDia(p.postar || hojeISO));
  const ok = fs.existsSync(dir) && fs.readdirSync(dir).some((f) => f.endsWith(`-${p.slug}.mp4`) && fs.statSync(path.join(dir, f)).size > 100000);
  if (!ok) naoRenderizados.push(p.slug);
}
if (naoRenderizados.length) problemas.push(`Sem vídeo pronto: ${naoRenderizados.join(", ")}`);
log(`Conferência: ${naoRenderizados.length ? naoRenderizados.length + " vídeo(s) faltando" : "todos os vídeos estão prontos"}`);

// 4) Cópia das pastas de hoje em diante para o Google Drive (só arquivos novos ou alterados)
const drive = expandir(cfg.pastaDrive);
const raizDrive = drive ? path.parse(drive).root : "";
if (!cfg.pastaDrive) log("Google Drive: VIDEOS-PRONTOS ja sincroniza direto (copia desligada)");
else if (!fs.existsSync(raizDrive)) problemas.push(`Google Drive (${raizDrive}) não encontrado — vídeos NÃO copiados`);
else try {
  let copiados = 0;
  const dias = [...new Set(ativos().map((p) => pastaDia(p.postar || hojeISO)))];
  for (const dia of dias) {
    const origem = path.join(raiz, "VIDEOS-PRONTOS", dia);
    if (!fs.existsSync(origem)) continue;
    const dest = path.join(drive, dia);
    for (const f of fs.readdirSync(origem)) {
      const de = path.join(origem, f);
      if (!fs.statSync(de).isFile()) continue;
      const para = path.join(dest, f);
      if (fs.existsSync(para) && fs.statSync(para).size === fs.statSync(de).size) continue;
      if (!TESTE) { fs.mkdirSync(dest, { recursive: true }); fs.copyFileSync(de, para); }
      copiados++;
    }
  }
  log(`Google Drive: ${copiados} arquivo(s) ${TESTE ? "seriam copiados" : "copiados"} para ${drive}`);
} catch (e) { problemas.push(`Erro ao copiar para o Google Drive: ${e.message}`); }

// 5) Limpeza da pasta de usados — só se tudo deu certo
const usados = expandir(cfg.pastaUsados);
if (cfg.limparUsados && !problemas.length && fs.existsSync(usados)) {
  const itens = fs.readdirSync(usados);
  if (!TESTE) for (const i of itens) fs.rmSync(path.join(usados, i), { recursive: true, force: true });
  log(`Limpeza: ${itens.length} item(ns) ${TESTE ? "seriam apagados" : "apagados"} de ${usados}`);
} else if (problemas.length) log("Limpeza: pulada porque houve problemas (nada foi apagado)");

// Resumo
const resumo = [`ÚLTIMA EXECUÇÃO DO FAZER-TUDO: ${hojeISO} ${carimbo()}${TESTE ? " (TESTE)" : ""}`, "",
  problemas.length ? "ATENÇÃO:" : "Tudo certo! Vídeos prontos e copiados.", ...problemas.map((x) => " - " + x), "", `Log completo: logs\\fazer-tudo-${hojeISO}.log`];
fs.writeFileSync(path.join(raiz, "VIDEOS-PRONTOS", "ULTIMA-EXECUCAO.txt"), resumo.join("\r\n"), "utf8");
log(problemas.length ? `TERMINOU COM ${problemas.length} PROBLEMA(S)` : "TERMINOU SEM PROBLEMAS");
process.exit(problemas.length ? 2 : 0);
