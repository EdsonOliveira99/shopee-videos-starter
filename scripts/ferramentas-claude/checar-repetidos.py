"""Confere se os produtos de uma data repetem algo já feito.
Uso (na pasta Remotion):  python scripts/ferramentas-claude/checar-repetidos.py 2026-10-26
Compara com TODOS os outros JSONs (produtos/ e produtos/_arquivados/).

Regra (24/10): o MESMO PRODUTO pode voltar, desde que o VÍDEO seja diferente.
- Mesmo produto = só AVISO (mostra com qual vídeo anterior comparar).
- PROBLEMA (sai com código 1): roteiro/gancho/legenda parecidos com qualquer vídeo,
  ou, no mesmo produto: mesma capa, mídias quase iguais, ou dois no mesmo dia."""
import json, glob, re, sys, unicodedata
from datetime import date
from difflib import SequenceMatcher

def norm(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'\[[^\]]*\]', ' ', s)          # tira tags tipo [excited]
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()

def sim(a, b):
    if len(norm(a)) < 3 or len(norm(b)) < 3: return 0.0
    return SequenceMatcher(None, ' '.join(norm(a)), ' '.join(norm(b))).ratio()

def dia(d):
    try: return date.fromisoformat(d.get('postar', ''))
    except Exception: return None

def arquivos(d):
    return [m.get('arquivo') for m in d.get('midias', []) if m.get('arquivo')]

data = sys.argv[1] if len(sys.argv) > 1 else None
todos = []
for f in glob.glob('produtos/*.json') + glob.glob('produtos/_arquivados/**/*.json', recursive=True):
    try: todos.append((f, json.load(open(f, encoding='utf8'))))
    except Exception: pass
novos = [(f, d) for f, d in todos if '_arquivados' not in f and (data is None or d.get('postar') == data)]
antigos = [(f, d) for f, d in todos if (f, d) not in novos]
problemas, avisos = [], []

def compara(f1, d1, f2, d2):
    mesmo = (d1.get('itemId') and d1.get('itemId') == d2.get('itemId')) or \
            sim(d1.get('produtoNome'), d2.get('produtoNome')) > 0.85
    if mesmo:
        avisos.append(f'MESMO PRODUTO (permitido se o vídeo for diferente): {f1} x {f2}')
        d1d, d2d = dia(d1), dia(d2)
        if d1d and d2d and d1d == d2d:
            problemas.append(f'MESMO PRODUTO DUAS VEZES NO MESMO DIA: {f1} x {f2}')
        elif d1d and d2d and abs((d1d - d2d).days) < 3:
            avisos.append(f'  intervalo curto ({abs((d1d - d2d).days)} dia/s) - ideal 3+ dias: {f1} x {f2}')
        if d1.get('capa') and d1.get('capa') == d2.get('capa'):
            problemas.append(f'MESMA CAPA no mesmo produto ({d1.get("capa")}): {f1} x {f2}')
        a1, a2 = arquivos(d1), arquivos(d2)
        if a1 and a2:
            if a1 == a2:
                problemas.append(f'MESMAS MÍDIAS NA MESMA ORDEM: {f1} x {f2}')
            elif len(set(a1) & set(a2)) / max(len(set(a1)), 1) > 0.7:
                problemas.append(f'MÍDIAS QUASE IGUAIS ({len(set(a1) & set(a2))}/{len(set(a1))} repetidas): {f1} x {f2}')
        if d1.get('musica') and d1.get('musica') == d2.get('musica'):
            avisos.append(f'  mesma música do vídeo anterior desse produto - troque: {f1} x {f2}')
    r = sim(d1.get('roteiro'), d2.get('roteiro'))
    if r > 0.6:
        problemas.append(f'ROTEIRO PARECIDO ({r:.0%}): {f1} x {f2}')
    if norm(d1.get('gancho')) and norm(d1.get('gancho')) == norm(d2.get('gancho')):
        problemas.append(f'MESMO GANCHO "{d1.get("gancho")}": {f1} x {f2}')
    if sim(d1.get('legenda'), d2.get('legenda')) > 0.8:
        problemas.append(f'LEGENDA PARECIDA: {f1} x {f2}')

for i, (f1, d1) in enumerate(novos):
    for f2, d2 in antigos + novos[i+1:]:
        compara(f1, d1, f2, d2)

avisos = sorted(set(avisos)); problemas = sorted(set(problemas))
print(f'{len(novos)} produto(s) conferido(s) contra {len(antigos)} anterior(es).')
if avisos: print('AVISOS:\n' + '\n'.join(avisos))
print(('PROBLEMAS:\n' + '\n'.join(problemas)) if problemas else 'OK: nenhum vídeo repetido.')
sys.exit(1 if problemas else 0)
