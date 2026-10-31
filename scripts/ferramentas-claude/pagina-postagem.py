"""Gera o documento do dia para a página "Postagens do Dia" (artifact).
Uso: python scripts/ferramentas-claude/pagina-postagem.py 2026-10-25  -> _BACKUPS/postagem-<data>.json
Mesma numeração/nome de arquivo do render-todos (N-HHhMM-slug.mp4, ordem por horário)."""
import json, glob, sys
data = sys.argv[1]
ps = []
for f in glob.glob('produtos/*.json'):
    d = json.load(open(f, encoding='utf8'))
    if d.get('postar') == data: ps.append(d)
ps.sort(key=lambda d: d.get('horario', ''))
vs = []
for i, d in enumerate(ps, 1):
    h = d.get('horario', '00:00')
    vs.append({
        'n': i, 'hora': h, 'arquivo': f"{i}-{h.replace(':', 'h')}-{d['slug']}.mp4",
        'nome': d.get('nomeProduto', ''), 'titulo': d.get('produtoNome', ''),
        'loja': d.get('lojaNome', ''), 'itemId': str(d.get('itemId', '')),
        'link': f"https://shopee.com.br/product/{d.get('lojaId','')}/{d.get('itemId','')}",
        'legenda': d.get('legenda', ''),
    })
out = f'_BACKUPS/postagem-{data}.json'
json.dump({'videos': vs}, open(out, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(out, len(vs), 'video(s)')
