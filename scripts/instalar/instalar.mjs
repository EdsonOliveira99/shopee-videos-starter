// Instalador: faz as perguntas da conta e deixa a pasta pronta para a primeira leva.
// Rode pelo 1-INSTALAR.bat. Pode rodar de novo quando quiser: as respostas atuais viram o padrão.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const arq = (...p) => path.join(raiz, ...p);
const ler = (f) => JSON.parse(fs.readFileSync(arq(f), "utf8").replace(/^\uFEFF/, ""));
const gravar = (f, obj) => fs.writeFileSync(arq(f), JSON.stringify(obj, null, 2) + "\n", "utf8");
const rodar = (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: raiz, stdio: "inherit", ...opts });

// Vozes que já têm dono no grupo: a Shopee pede para não usar o mesmo apresentador de IA em várias contas.
// Quando alguém escolher uma voz, acrescente aqui para os próximos não repetirem.
const VOZES_EM_USO = [{ id: "ohZOfA9iwlZ5nOsoY7LB", nome: "Roberta - Casual Sales" }];
const CREDITOS_POR_VIDEO = 110; // medido: roteiro de 230–290 caracteres

// respostas entram numa fila: nada se perde se várias linhas chegarem de uma vez (colar, ou respostas por pipe)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const fila = [], espera = [];
let oculto = false, fechado = false;
rl.on("line", (l) => (espera.length ? espera.shift()(l) : fila.push(l)));
rl.on("close", () => { fechado = true; if (espera.length) { console.log("\nEntrada encerrada antes do fim. Nada foi instalado."); process.exit(1); } });
// com oculto, a chave aparece como **** enquanto é colada
rl._writeToOutput = (s) => rl.output.write(oculto && s !== rl.getPrompt() ? (/[\r\n]/.test(s) ? "\n" : "*".repeat(s.length)) : s);
const perguntar = (q, ocultar = false) => new Promise((ok) => {
  oculto = ocultar;
  rl.setPrompt(q);
  rl.prompt();
  const entregar = (l) => { oculto = false; if (!rl.terminal) console.log(ocultar ? "****" : l); ok(l.trim()); };
  if (fila.length) entregar(fila.shift());
  else if (fechado) { console.log("\nEntrada encerrada antes do fim. Nada foi instalado."); process.exit(1); }
  else espera.push(entregar);
});

let etapa = 0;
const TOTAL = 11;
const titulo = (t) => console.log(`\n────────────────────────────────────────\n[${++etapa}/${TOTAL}] ${t}`);

async function escolher(opcoes, padrao = 1) {
  opcoes.forEach((o, i) => console.log(`   ${i + 1}) ${o.rotulo}`));
  for (;;) {
    const r = await perguntar(`   Escolha [Enter = ${padrao}]: `);
    const n = r === "" ? padrao : Number(r);
    if (Number.isInteger(n) && n >= 1 && n <= opcoes.length) return opcoes[n - 1];
    console.log("   Digite só o número de uma das opções.");
  }
}
async function texto(q, padrao = "", valido = () => true, erro = "Valor inválido.") {
  for (;;) {
    const r = (await perguntar(`   ${q}${padrao ? ` [Enter = ${padrao}]` : ""}: `)) || padrao;
    if (r && valido(r)) return r;
    console.log(`   ${erro}`);
  }
}
const ehHora = (h) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);
const minutos = (h) => +h.slice(0, 2) * 60 + +h.slice(3);
const indice = (lista, f) => lista.findIndex(f) + 1; // 0 = não achou

async function elevenlabs(chave, rota) {
  try {
    const r = await fetch(`https://api.elevenlabs.io${rota}`, { headers: { "xi-api-key": chave } });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

// ───────────────────────────── perguntas
const conta = ler("conta.json");
const cfg = ler("scripts/v2/config.json");
const pont = ler("scripts/oportunidades/config-pontuacao.json");
const reinstalacao = conta.instalado;
const agendadoAntes = reinstalacao && conta.agendamento.ativo;

console.log(`
========================================
  SHOPEE VÍDEOS — instalação da conta
========================================
${reinstalacao ? "Você já instalou antes: Enter mantém cada resposta atual." : `São ${TOTAL} perguntas rápidas. Tenha em mãos:
 - a chave da API do ElevenLabs (elevenlabs.io > Developers > API Keys)
 - o nicho combinado com o grupo (contas no mesmo nicho competem entre si)`}`);

titulo("Seu nome");
console.log("   É como o Claude vai te chamar e como as levas ficam registradas.");
conta.nome = await texto("Nome", conta.nome);

titulo("Nicho da conta");
console.log("   Combine com o grupo: duas contas no mesmo nicho competem e a Shopee penaliza conteúdo repetido.");
const NICHOS = [
  { rotulo: "Casa e cozinha", categoria: 100636 },
  { rotulo: "Organização e limpeza", categoria: 100636 },
  { rotulo: "Pet", categoria: null },
  { rotulo: "Carro e moto", categoria: null },
  { rotulo: "Eletroportáteis e tecnologia", categoria: null },
  { rotulo: "Beleza e cuidados pessoais (sem mostrar rosto)", categoria: null },
  { rotulo: "Fitness e esporte", categoria: null },
  { rotulo: "Outro (digitar)", outro: true, categoria: null },
];
const nicho = await escolher(NICHOS, conta.nicho ? indice(NICHOS, (n) => n.rotulo === conta.nicho || (n.outro && !NICHOS.some((m) => m.rotulo === conta.nicho))) || 1 : 1);
conta.nicho = nicho.outro ? await texto("Qual nicho", NICHOS.some((m) => m.rotulo === conta.nicho) ? "" : conta.nicho) : nicho.rotulo;

titulo("Chave da API do ElevenLabs (narração)");
console.log("   Fica só neste PC, no arquivo CHAVE-ELEVENLABS.txt (fora do git). Ninguém precisa ver.");
const arqChave = arq("CHAVE-ELEVENLABS.txt");
let chave = fs.existsSync(arqChave) ? fs.readFileSync(arqChave, "utf8").replace(/^\uFEFF/, "").trim() : "";
const acaoChave = await escolher(chave
  ? [{ rotulo: "Manter a chave que já está salva", v: "manter" }, { rotulo: "Colar uma chave nova", v: "colar" }]
  : [{ rotulo: "Colar a chave agora", v: "colar" }, { rotulo: "Pular (colo depois no CHAVE-ELEVENLABS.txt)", v: "pular" }]);
if (acaoChave.v === "colar") {
  chave = await perguntar("   Cole a chave e tecle Enter (botão direito cola): ", true);
  if (chave) fs.writeFileSync(arqChave, chave, "utf8");
}
let assinatura = null;
if (chave) {
  assinatura = await elevenlabs(chave, "/v1/user/subscription");
  if (assinatura) console.log(`   ✔ Chave aceita. Plano: ${assinatura.tier} — ${assinatura.character_count?.toLocaleString("pt-BR")} de ${assinatura.character_limit?.toLocaleString("pt-BR")} créditos usados neste mês.`);
  else console.log("   ⚠ Não consegui confirmar a chave (sem internet, chave errada ou com permissões limitadas). Sigo assim mesmo.");
}

titulo("Voz da narração");
console.log("   Precisa ser uma voz SÓ desta conta. Ouça as opções em elevenlabs.io > Voices e adicione as que gostar à sua conta.");
const emUso = (id) => VOZES_EM_USO.find((v) => v.id === id);
const vozes = chave ? (await elevenlabs(chave, "/v1/voices"))?.voices ?? [] : [];
const emPortugues = (v) => [v.labels?.language, v.labels?.accent].some((l) => /^pt|portug|brazil/i.test(l ?? ""));
vozes.sort((a, b) => emPortugues(b) - emPortugues(a));
const descrever = (v) => [v.labels?.gender, v.labels?.accent || v.labels?.language, v.labels?.use_case].filter(Boolean).join(", ");
const opcoesVoz = [
  ...vozes.filter((v) => !emUso(v.voice_id)).map((v) => ({ rotulo: `${v.name}${descrever(v) ? `  (${descrever(v)})` : ""}`, id: v.voice_id, nome: v.name })),
  { rotulo: "Colar o ID de uma voz (voice_id)", colar: true },
  { rotulo: conta.voz?.id ? `Manter a atual: ${conta.voz.nome || conta.voz.id}` : "Decidir depois com o Claude", manter: true },
];
if (chave && !vozes.length) console.log("   (não consegui listar as vozes da sua conta — dá para colar o ID)");
for (;;) {
  const v = await escolher(opcoesVoz, conta.voz?.id || !vozes.length ? opcoesVoz.length : 1);
  if (v.manter) break;
  const id = v.colar ? await texto("voice_id", "", (s) => /^[A-Za-z0-9]{10,40}$/.test(s), "Um voice_id tem só letras e números (ex.: 21m00Tcm4TlvDq8ikWAM).") : v.id;
  if (emUso(id)) { console.log(`   ✖ A voz "${emUso(id).nome}" já é usada em outra conta do grupo. Escolha outra.`); continue; }
  conta.voz = { id, nome: v.nome || (vozes.find((x) => x.voice_id === id)?.name ?? "") };
  break;
}

titulo("Quantos vídeos por dia");
const QTDS = [10, 20, 30].map((n) => ({ rotulo: `${n} vídeos  (~${(n * CREDITOS_POR_VIDEO * 30).toLocaleString("pt-BR")} créditos ElevenLabs por mês)`, n }));
QTDS.push({ rotulo: "Outro número", outro: true });
if (assinatura?.character_limit) console.log(`   Seu plano atual tem ${assinatura.character_limit.toLocaleString("pt-BR")} créditos por mês.`);
const qtd = await escolher(QTDS, [10, 20, 30].includes(conta.videosPorDia) ? [10, 20, 30].indexOf(conta.videosPorDia) + 1 : 4);
conta.videosPorDia = qtd.outro ? Number(await texto("Quantos por dia", String(conta.videosPorDia), (s) => /^\d+$/.test(s) && +s >= 1 && +s <= 60, "De 1 a 60.")) : qtd.n;

titulo("Horário das postagens");
const JANELAS = [["09:00", "21:30"], ["08:00", "22:00"], ["11:00", "23:00"]].map(([i, f]) => ({ rotulo: `Das ${i} às ${f}`, i, f }));
JANELAS.push({ rotulo: "Outro horário (digitar)", outro: true });
const jan = await escolher(JANELAS, indice(JANELAS, (j) => j.i === conta.janela.inicio && j.f === conta.janela.fim) || JANELAS.length);
if (jan.outro) {
  const i = await texto("Primeira postagem (HH:MM)", conta.janela.inicio, ehHora, "Use o formato 09:00.");
  const f = await texto("Última postagem (HH:MM)", conta.janela.fim, (h) => ehHora(h) && minutos(h) > minutos(i), "Use 21:30, depois da primeira.");
  conta.janela = { inicio: i, fim: f };
} else conta.janela = { inicio: jan.i, fim: jan.f };
const passo = conta.videosPorDia > 1 ? Math.floor((minutos(conta.janela.fim) - minutos(conta.janela.inicio)) / (conta.videosPorDia - 1)) : 0;
if (passo) console.log(`   → um vídeo a cada ${passo} minutos.`);

titulo("Critérios do garimpo de produtos");
console.log("   Comissão Xtra é sempre obrigatória. Dá para ajustar depois em scripts/oportunidades/config-pontuacao.json.");
const CRIT = [
  { rotulo: "Padrão:        R$ 30–150, comissão ≥ R$ 5, nota ≥ 4,7, 300 vendas/mês", p: [30, 150, 5, 4.7, 300, 50] },
  { rotulo: "Mais exigente: R$ 40–200, comissão ≥ R$ 10, nota ≥ 4,8, 600 vendas/mês", p: [40, 200, 10, 4.8, 600, 100] },
  { rotulo: "Mais aberto:   R$ 15–250, comissão ≥ R$ 3, nota ≥ 4,5, 100 vendas/mês", p: [15, 250, 3, 4.5, 100, 30] },
  { rotulo: "Personalizar (digitar cada valor)", outro: true },
];
const E = pont.eliminatorias;
const atual = [E.preco_minimo, E.preco_maximo, E.comissao_minima_reais, E.nota_minima, E.vendas_30d_minimas, E.estoque_minimo];
const crit = await escolher(CRIT, indice(CRIT, (c) => c.p && c.p.every((x, k) => x === atual[k])) || CRIT.length);
let p = crit.p;
if (crit.outro) {
  const num = (q, v) => texto(q, String(v), (s) => !isNaN(+s.replace(",", ".")) && +s.replace(",", ".") >= 0, "Digite um número.").then((s) => +s.replace(",", "."));
  p = [await num("Preço mínimo (R$)", atual[0]), await num("Preço máximo (R$)", atual[1]), await num("Comissão mínima por venda (R$)", atual[2]),
    await num("Nota mínima (0 a 5)", atual[3]), await num("Vendas mínimas nos últimos 30 dias", atual[4]), await num("Estoque mínimo", atual[5])];
}

titulo("Cor de destaque da conta");
console.log("   Cor dos selos e caixas de texto. O Claude pode variar por produto, mas esta é a cor da marca.");
const CORES = [["Laranja Shopee", "#EE4D2D"], ["Vermelho", "#D32F2F"], ["Rosa", "#E91E63"], ["Roxo", "#7B1FA2"], ["Azul", "#1E3A8A"], ["Verde", "#2E7D32"]]
  .map(([n, c]) => ({ rotulo: `${n} (${c})`, c }));
CORES.push({ rotulo: "Outra (código #RRGGBB)", outro: true });
const cor = await escolher(CORES, indice(CORES, (c) => c.c === conta.corDestaque) || CORES.length);
conta.corDestaque = cor.outro ? (await texto("Cor", conta.corDestaque, (s) => /^#[0-9A-Fa-f]{6}$/.test(s), "Use o formato #EE4D2D.")).toUpperCase() : cor.c;

titulo("Automação de madrugada");
console.log("   O PC gera narrações e renderiza sozinho todo dia (pode estar em suspensão, não desligado).");
const AG = [{ rotulo: "Sim, às 04:00 (recomendado)", h: "04:00" }, { rotulo: "Sim, em outro horário", outro: true }, { rotulo: "Não, vou rodar o FAZER-TUDO.bat na mão", nao: true }];
const ag = await escolher(AG, !conta.agendamento.ativo && reinstalacao ? 3 : conta.agendamento.hora === "04:00" ? 1 : 2);
conta.agendamento = ag.nao ? { ativo: false, hora: conta.agendamento.hora } : { ativo: true, hora: ag.outro ? await texto("Horário (HH:MM)", conta.agendamento.hora, ehHora, "Use o formato 04:00.") : ag.h };

titulo("Google Drive");
const DR = [
  { rotulo: "Não uso o Google Drive", v: "nao" },
  { rotulo: "Já sincronizo a pasta VIDEOS-PRONTOS pelo Google Drive para computador", v: "sincroniza" },
  { rotulo: "Copiar os vídeos prontos para uma pasta do Drive (digitar o caminho)", v: "copiar" },
];
const dr = await escolher(DR, cfg.pastaDrive ? 3 : conta.drive === "sincroniza" ? 2 : 1);
conta.drive = dr.v;
if (dr.v === "copiar") {
  cfg.pastaDrive = await texto("Pasta do Drive (ex.: G:\\Meu Drive\\Shopee)", cfg.pastaDrive);
  if (!fs.existsSync(cfg.pastaDrive)) console.log("   ⚠ Essa pasta não existe agora. O FAZER-TUDO avisa se ela continuar faltando.");
} else cfg.pastaDrive = "";

titulo("Versão para o Instagram");
console.log("   Gera uma cópia de cada vídeo terminando em \"Comenta EU QUERO\" (gasta mais tempo de render).");
const ig = await escolher([{ rotulo: "Não, só Shopee Vídeos (recomendado)", v: false }, { rotulo: "Sim, gerar também a versão Instagram", v: true }], cfg.instagram.ativo ? 2 : 1);
cfg.instagram.ativo = ig.v;
rl.close();

// ───────────────────────────── grava as respostas
Object.assign(E, { preco_minimo: p[0], preco_maximo: p[1], comissao_minima_reais: p[2], nota_minima: p[3], vendas_30d_minimas: p[4], estoque_minimo: p[5], categoria: nicho.categoria });
gravar("scripts/oportunidades/config-pontuacao.json", pont);
const natal = ler("scripts/oportunidades/config-natal.json");
Object.assign(natal.eliminatorias, E);
gravar("scripts/oportunidades/config-natal.json", natal);
conta.instalado = true;
conta.instaladoEm ??= new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no horário local
gravar("conta.json", conta);
gravar("scripts/v2/config.json", cfg);
console.log("\n✔ Respostas salvas em conta.json");

// ───────────────────────────── prepara a pasta
for (const p of ["produtos/_arquivados", "_desativados", "public/produtos", "public/instagram", "public/musicas", "VIDEOS-PRONTOS", "VIDEOS-ARQUIVO",
  "VIDEOS-INSTAGRAM", "legendas", "logs", "out", "_BACKUPS", "scripts/oportunidades/rodadas", "PARA-O-CLAUDE/skills"]) fs.mkdirSync(arq(p), { recursive: true });

if (!fs.existsSync(arq("node_modules", "remotion"))) {
  console.log("\nInstalando as dependências (só da primeira vez, alguns minutos)...");
  if (rodar("npm install", [], { shell: true }).status !== 0) { console.log("✖ O npm install falhou. Mande um print desta janela."); process.exit(1); }
}
console.log("\nConferindo o navegador que o Remotion usa para renderizar...");
rodar("npx remotion browser ensure", [], { shell: true });

// tar do Windows: grava o zip com "/" (o Compress-Archive grava "\" e o claude.ai pode recusar a skill)
const zipar = (destino, itens, pasta = raiz) => {
  fs.rmSync(destino, { force: true });
  return spawnSync(path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe"), ["-a", "-cf", destino, ...itens], { cwd: pasta }).status === 0;
};
if (!fs.existsSync(arq("_BACKUPS", "versao-estavel-codigo.zip"))) {
  const itens = ["src", "scripts", "package.json", "package-lock.json", "remotion.config.ts", "tsconfig.json", ...fs.readdirSync(raiz).filter((f) => f.endsWith(".bat"))];
  console.log(zipar(arq("_BACKUPS", "versao-estavel-codigo.zip"), itens)
    ? "✔ Cópia da versão estável salva (usada pelo VOLTAR-VERSAO-ESTAVEL.bat)" : "⚠ Não consegui criar _BACKUPS\\versao-estavel-codigo.zip");
}
const skills = fs.readdirSync(arq(".claude", "skills"));
console.log(skills.every((s) => zipar(arq("PARA-O-CLAUDE", "skills", `${s}.zip`), [s], arq(".claude", "skills")))
  ? "✔ Skills empacotadas em PARA-O-CLAUDE\\skills (para enviar ao claude.ai)" : "⚠ Não consegui empacotar as skills em PARA-O-CLAUDE\\skills");

if (conta.agendamento.ativo) {
  const ok = rodar("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", arq("scripts", "v2", "agendar.ps1"), "-Hora", conta.agendamento.hora]).status === 0;
  if (!ok) console.log("⚠ Não consegui agendar. Depois rode AGENDAR-MADRUGADA.bat.");
} else if (agendadoAntes) rodar("schtasks", ["/Delete", "/TN", "Shopee-FazerTudo", "/F"], { stdio: "ignore" }); // só desfaz o que esta instalação ligou

// git: cada leva vira um commit, e dá para desfazer qualquer mudança no código
const git = (...a) => spawnSync("git", a, { cwd: raiz, encoding: "utf8" });
if (git("--version").status === 0) {
  if (!fs.existsSync(arq(".git"))) git("init", "-b", "main");
  if (!git("config", "user.email").stdout.trim()) { git("config", "user.name", conta.nome); git("config", "user.email", "shopee-videos@local"); }
  git("add", "-A");
  const r = git("commit", "-m", `${reinstalacao ? "Reconfiguração" : "Instalação"} da conta: ${conta.nome} (${conta.nicho})`);
  console.log(r.status === 0 ? "✔ Configuração registrada no git" : "  (git: nada novo para registrar)");
} else console.log("⚠ Git não encontrado. Recomendo instalar (git-scm.com): é o que permite desfazer mudanças.");

console.log(`
========================================
  PRONTO, ${conta.nome.toUpperCase()}!
========================================
Nicho: ${conta.nicho}  |  ${conta.videosPorDia} vídeos/dia, ${conta.janela.inicio}–${conta.janela.fim}
Voz: ${conta.voz?.id ? conta.voz.nome || conta.voz.id : "ainda não escolhida (rode este instalador de novo ou peça ao Claude)"}
Chave ElevenLabs: ${chave ? "salva" : "FALTANDO — cole no CHAVE-ELEVENLABS.txt"}
Automação: ${conta.agendamento.ativo ? `todo dia às ${conta.agendamento.hora}` : "desligada"}

Próximos passos:
 1. Abra esta pasta no Claude (Claude Code ou app do Claude com acesso à pasta).
    Se usar o claude.ai, envie os .zip de PARA-O-CLAUDE\\skills em Configurações > Skills
    e os documentos de PARA-O-CLAUDE\\documentos no seu projeto.
 2. Peça: "faz a primeira leva de ${conta.videosPorDia} vídeos para amanhã".
    Na primeira vez o Claude também monta a sua biblioteca de músicas (public\musicas vem vazia).
 3. Depois rode FAZER-TUDO.bat${conta.agendamento.ativo ? " (ou espere a madrugada)" : ""} e poste pela pasta VIDEOS-PRONTOS.
`);
