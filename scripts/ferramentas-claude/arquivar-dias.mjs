// Move as pastas de dias que já passaram de VIDEOS-PRONTOS (sincronizada com o Google Drive)
// para VIDEOS-ARQUIVO (só no PC). Nunca apaga nada. 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PRONTOS = path.join(raiz, 'VIDEOS-PRONTOS');
const ARQ = path.join(raiz, 'VIDEOS-ARQUIVO');
fs.mkdirSync(ARQ, { recursive: true });
const hoje = new Date(); const h = hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate();
let n = 0;
for (const nome of fs.readdirSync(PRONTOS)) {
  const m = nome.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) continue;
  const d = +m[3] * 10000 + +m[2] * 100 + +m[1];
  if (d >= h) continue;
  let destino = path.join(ARQ, nome), k = 2;
  while (fs.existsSync(destino)) destino = path.join(ARQ, `${nome}-${k++}`);
  try { fs.renameSync(path.join(PRONTOS, nome), destino); n++; console.log('arquivado:', nome); }
  catch (e) { console.log('não consegui mover', nome, '-', e.message); }
}
console.log(`Dias antigos movidos para VIDEOS-ARQUIVO: ${n}`);
