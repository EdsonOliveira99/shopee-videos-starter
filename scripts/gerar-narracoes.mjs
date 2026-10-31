// Gera as narrações no ElevenLabs usando a SUA chave da API (arquivo CHAVE-ELEVENLABS.txt na pasta Remotion).
// Para cada produtos/*.json que tenha "roteiro" e ainda não tenha o áudio, cria public/<narracao>.mp3
// e salva junto os tempos de cada palavra (<narracao>.tempos.json), usados para sincronizar as cenas.
//
// Uso:  node scripts/gerar-narracoes.mjs            -> só as que faltam
//       node scripts/gerar-narracoes.mjs potes-vidro -> refaz só essa
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arqChave = path.join(raiz, "CHAVE-ELEVENLABS.txt");
if (!fs.existsSync(arqChave)) {
  console.error("Não achei o arquivo CHAVE-ELEVENLABS.txt na pasta Remotion. Cole a chave da API nele e rode de novo.");
  process.exit(1);
}
const chave = fs.readFileSync(arqChave, "utf8").replace(/^﻿/, "").trim();
if (!chave) { console.error("O arquivo CHAVE-ELEVENLABS.txt está vazio."); process.exit(1); }

const conta = JSON.parse(fs.readFileSync(path.join(raiz, "conta.json"), "utf8"));
const VOZ_PADRAO = conta.voz?.id; // voz escolhida no 1-INSTALAR.bat (o JSON do produto pode trocar com "voz")
const MODELOS = ["eleven_v4", "eleven_v3", "eleven_multilingual_v2"]; // tenta na ordem (v4: voz mais animada)
const so = process.argv[2];

const pasta = path.join(raiz, "produtos");
const lista = fs.readdirSync(pasta).filter((f) => f.endsWith(".json"))
  .map((f) => ({ arq: path.join(pasta, f), p: JSON.parse(fs.readFileSync(path.join(pasta, f), "utf8")) }))
  .filter(({ p }) => p.roteiro && p.narracao && (so ? p.slug === so : !fs.existsSync(path.join(raiz, "public", p.narracao))));

if (!lista.length) { console.log("Nenhuma narração pendente."); process.exit(0); }
if (!VOZ_PADRAO && lista.some(({ p }) => !p.voz)) {
  console.error("Nenhuma voz configurada. Rode o 1-INSTALAR.bat e escolha a voz da narração.");
  process.exit(1);
}

const gerar = async (texto, voz, modelo) => {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": chave, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texto, model_id: modelo }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
};

for (const { p } of lista) {
  const voz = p.voz || VOZ_PADRAO;
  process.stdout.write(`▶ ${p.slug} ... `);
  let ok = false;
  for (const modelo of MODELOS) {
    // eleven_multilingual_v2 não entende as marcações [excited] etc.
    const texto = modelo === "eleven_v4" || modelo === "eleven_v3" ? p.roteiro : p.roteiro.replace(/\[[^\]]+\]\s*/g, "");
    try {
      const j = await gerar(texto, voz, modelo);
      const destino = path.join(raiz, "public", p.narracao);
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, Buffer.from(j.audio_base64, "base64"));
      fs.writeFileSync(destino.replace(/\.mp3$/, ".tempos.json"), JSON.stringify(j.normalized_alignment || j.alignment));
      console.log(`ok (${modelo})`);
      ok = true;
      break;
    } catch (e) {
      console.log(`\n   falhou com ${modelo}: ${String(e.message).slice(0, 200)}`);
    }
  }
  if (!ok) console.log(`✖ ${p.slug}: não consegui gerar.`);
  await new Promise((r) => setTimeout(r, 1500)); // um de cada vez, sem pressa
}
console.log("\nPronto! Me avise que eu sincronizo as cenas com as falas.");
