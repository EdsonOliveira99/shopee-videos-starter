// Renderiza os vídeos da pasta produtos/ e organiza a saída por DATA DE POSTAGEM.
//
//   VIDEOS-PRONTOS/21-10-2026/1-09h00-garrafa-termica.mp4
//   VIDEOS-PRONTOS/21-10-2026/1-09h00-garrafa-termica.txt   <- só a legenda + hashtags (pra copiar e colar)
//   VIDEOS-PRONTOS/21-10-2026/00-POSTAGEM.txt               <- resumo do dia: ordem, horário, produto e legenda
//
// No JSON do produto (opcionais):
//   "postar":  "2026-10-21"   data de postagem (sem isso, vai para a pasta de hoje)
//   "horario": "09:00"        entra no nome do arquivo e na ordem do dia
//   "produtoNome": "..."      nome exato do anúncio, para vincular no app
//   "legenda": "..."          legenda pronta (máx. 150 caracteres)
//
// Uso:  npm run render                     -> só os que ainda não foram renderizados
//       npm run render -- --refazer         -> refaz todos
//       npm run render -- garrafa-termica   -> só esse (sempre refaz)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaProdutos = path.join(raiz, "produtos");
// vídeos prontos (só eles) ficam em VIDEOS-PRONTOS/DD-MM-AAAA — pasta para sincronizar no Google Drive
const pastaSaida = path.join(raiz, "VIDEOS-PRONTOS");
const pastaOut = path.join(raiz, "out"); // arquivos internos (_antigos, _postados...) continuam aqui
fs.mkdirSync(pastaSaida, { recursive: true });

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// número do vídeo dentro do dia (ordem pelo horário)
let ordem = {};
const base = (p) => {
  const n = ordem[p.slug];
  return [n, p.horario && p.horario.replace(":", "h"), p.slug].filter(Boolean).join("-");
};
const nomeArquivo = (p) => `${base(p)}.mp4`;
// pasta do dia no formato DD-MM-AAAA (o "postar" do JSON continua AAAA-MM-DD)
const pastaDia = (iso) => iso.split("-").reverse().join("-");
const destino = (p) => path.join(pastaSaida, pastaDia(p.postar || hoje()), nomeArquivo(p));

// procura um vídeo já renderizado desse produto em qualquer pasta de out/
const jaExiste = (slug) => {
  const procurar = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!e.name.startsWith("_") && procurar(path.join(dir, e.name))) return true; }
      // nome exato: "N-HHhMM-slug.mp4" (evita confundir "cabides-veludo-slim" com "50-cabides-veludo-slim") — 30/10/2026
      else if (e.name === `${slug}.mp4` || new RegExp(`^\\d+-\\d{2}h\\d{2}-${slug.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\.mp4$`).test(e.name)) return true;
    }
    return false;
  };
  return procurar(pastaSaida) || (fs.existsSync(pastaOut) && procurar(pastaOut));
};

const args = process.argv.slice(2);
const refazer = args.includes("--refazer");
const so = args.find((a) => !a.startsWith("--"));

const todos = fs.readdirSync(pastaProdutos).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(pastaProdutos, f), "utf8")));
// não renderiza vídeo cuja narração ainda não foi gerada
const semAudio = todos.filter((p) => p.narracao && !fs.existsSync(path.join(raiz, "public", p.narracao)));
if (semAudio.length) console.log(`⚠ Aguardando narração (rode o 4-GERAR-NARRACOES.bat): ${semAudio.map((p) => p.slug).join(", ")}`);
let fila = todos.filter((p) => !semAudio.includes(p));
// dias que já passaram não são renderizados de novo (ficam em VIDEOS-ARQUIVO) — 29/10/2026
if (!so) {
  const antigos = fila.filter((p) => p.postar && p.postar < hoje());
  if (antigos.length) console.log(`Pulando ${antigos.length} de dias que já passaram.`);
  fila = fila.filter((p) => !antigos.includes(p));
}
if (so) fila = fila.filter((p) => p.slug === so);
else if (!refazer) {
  const pulados = fila.filter((p) => jaExiste(p.slug));
  if (pulados.length) console.log(`Pulando ${pulados.length} já renderizados (use --refazer para refazer): ${pulados.map((p) => p.slug).join(", ")}`);
  fila = fila.filter((p) => !pulados.includes(p));
}

// gera o 00-POSTAGEM.txt de cada data (com todos os produtos daquela data)
const escreverRoteiros = () => {
  const porData = {};
  for (const p of todos) if (p.postar && p.postar >= hoje()) (porData[p.postar] ??= []).push(p);
  for (const [data, lista] of Object.entries(porData)) {
    lista.sort((a, b) => (a.horario || "99").localeCompare(b.horario || "99"));
    lista.forEach((p, i) => (ordem[p.slug] = i + 1));
    const dirDia = path.join(pastaSaida, pastaDia(data));
    fs.mkdirSync(dirDia, { recursive: true });
    const linhas = [`POSTAGENS DE ${data.split("-").reverse().join("/")}`, ""];
    for (const p of lista) {
      if (p.legenda) fs.writeFileSync(path.join(dirDia, `${base(p)}.txt`), p.legenda, "utf8");
      linhas.push(`VÍDEO ${ordem[p.slug]}  [${p.horario || "--:--"}]  ${nomeArquivo(p)}`);
      if (p.produtoNome) linhas.push(`Produto p/ vincular: ${p.produtoNome}`);
      if (p.termoBusca) linhas.push(`Buscar no app: ${p.termoBusca}${p.lojaNome ? `  (loja: ${p.lojaNome})` : ""}`);
      if (p.itemId && p.lojaId) linhas.push(`Link do produto: https://shopee.com.br/product/${p.lojaId}/${p.itemId}`, `ID do item: ${p.itemId}  |  ID da loja: ${p.lojaId}`);
      if (p.legenda) linhas.push(`Legenda (${[...p.legenda].length} caracteres):`, p.legenda);
      linhas.push("");
    }
    fs.writeFileSync(path.join(dirDia, "00-POSTAGEM.txt"), linhas.join("\r\n"), "utf8");
  }
};
escreverRoteiros();
// renomeia vídeos antigos (sem número) para o padrão novo
for (const p of todos) {
  if (!p.postar) continue;
  const dir = path.join(pastaSaida, pastaDia(p.postar));
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if ((f === `${p.slug}.mp4` || f.endsWith(`-${p.slug}.mp4`)) && f !== nomeArquivo(p)) fs.renameSync(path.join(dir, f), path.join(dir, nomeArquivo(p)));
    // legenda .txt com número antigo: renomeia para o número novo (ou tira do caminho se já existe)
    if (f.endsWith(`-${p.slug}.txt`) && f !== `${base(p)}.txt`) {
      const novo = path.join(dir, `${base(p)}.txt`);
      if (fs.existsSync(novo)) { fs.mkdirSync(path.join(dir, "_antigos"), { recursive: true }); fs.renameSync(path.join(dir, f), path.join(dir, "_antigos", f)); }
      else fs.renameSync(path.join(dir, f), novo);
    }
  }
}

if (!fila.length) { console.log(so ? `Não achei produtos/${so}.json` : "Nada novo para renderizar."); process.exit(0); }

const t0 = Date.now();
console.log("Preparando o projeto (bundle)...");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src", "index.ts") });
const browserExecutable = process.env.REMOTION_CHROME || undefined;

for (const inputProps of fila) {
  const id = inputProps.slug;
  const saida = destino(inputProps);
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  const comp = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
  console.log(`\n▶ ${id}  (${(comp.durationInFrames / comp.fps).toFixed(1)}s)  ->  ${path.relative(raiz, saida)}`);
  let ultimo = -1;
  const ti = Date.now();
  await renderMedia({
    composition: comp, serveUrl, codec: "h264", crf: 23, outputLocation: saida, inputProps, browserExecutable,
    concurrency: Math.max(1, Math.floor(os.cpus().length / 2)),
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 100);
      if (p % 10 === 0 && p !== ultimo) { ultimo = p; process.stdout.write(`  ${p}%`); }
    },
  });
  console.log(`\n✔ salvo  —  levou ${((Date.now() - ti) / 1000).toFixed(0)} s`);
}
console.log(`\nPronto! ${fila.length} vídeo(s) em ${((Date.now() - t0) / 60000).toFixed(1)} min no total.`);
