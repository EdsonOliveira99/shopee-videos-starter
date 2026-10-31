"""Pontuação de oportunidades (Shopee afiliados) - Remotion/scripts/oportunidades/pontuar.py
Uso: python pontuar.py candidatos.json usados.json [config-pontuacao.json] > rodada.json
- candidatos.json: dicionário {itemId: {...}} coletado do painel de afiliado (campos reais do painel).
- usados.json: lista [{itemId, nome, postar}] dos produtos que já viraram vídeo.
Regras: eliminatórias primeiro; depois notas 0..1 por critério x pesos (config). Dado ausente = 0 e baixa a confiança.
Nada é inventado: campos que o painel não traz ficam null e aparecem como "não verificado"."""
import json, sys, math, re, time, unicodedata
from difflib import SequenceMatcher


args = [a for a in sys.argv[1:] if not a.startswith('--')]
cand = json.load(open(args[0], encoding='utf8'))
usados = json.load(open(args[1], encoding='utf8'))
cfg = json.load(open(args[2] if len(args) > 2 else 'config-pontuacao.json', encoding='utf8'))
agora = time.time()

def pct(s):
    try: return float(str(s).replace('%', '').replace(',', '.').strip()) / 100
    except Exception: return None

def norm(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return ' '.join(re.sub(r'[^a-z0-9 ]+', ' ', s).split())

def faixa(v, zero, cheio):
    if v is None: return 0.0
    return max(0.0, min(1.0, (v - zero) / (cheio - zero)))

usados_ids = {u['itemId'] for u in usados if u.get('itemId')}
usados_nomes = [norm(u['nome'])[:80] for u in usados if u.get('nome')]

itens = list(cand.values())
# referência para conversão: posição relativa entre os candidatos do dia
def rank(vals):
    ok = sorted(v for v in vals if v is not None)
    return lambda v: 0.0 if v is None or not ok else sum(1 for x in ok if x <= v) / len(ok)
r_vendas = rank([math.log1p(i.get('vendas_30d') or 0) for i in itens])
r_hist = rank([math.log1p(i.get('vendas_total') or 0) for i in itens])
r_aval = rank([math.log1p(i.get('n_avaliacoes') or 0) for i in itens])
r_curt = rank([math.log1p(i.get('curtidas') or 0) for i in itens])

P = cfg['pesos']; E = cfg['eliminatorias']; C = cfg['comissao']; S = cfg['estoque']
saida = []
for i in itens:
    nome_n = norm(i.get('nome'))
    taxa = pct(i.get('taxa_total')); xtra = pct(i.get('taxa_xtra'))
    preco = i.get('preco_min')
    comissao = round(preco * taxa, 2) if preco and taxa is not None else None
    dias = round((agora - i['ctime']) / 86400) if i.get('ctime') else None
    motivos = []
    # ---- eliminatórias
    if i.get('itemId') in usados_ids: motivos.append('já teve vídeo (pode voltar só com vídeo diferente)')
    if E['exige_comissao_xtra'] and not (xtra and xtra > 0): motivos.append('sem Comissão Xtra')
    if comissao is None or comissao < E['comissao_minima_reais']: motivos.append(f'comissão abaixo de R$ {E["comissao_minima_reais"]:.0f}')
    if E.get('preco_minimo') and preco and preco < E['preco_minimo']: motivos.append(f'preço abaixo de R$ {E["preco_minimo"]:.0f}')
    if E.get('preco_maximo') and preco and preco > E['preco_maximo']: motivos.append(f'preço acima de R$ {E["preco_maximo"]:.0f}')
    if i.get('estoque') is not None and i['estoque'] < E['estoque_minimo']: motivos.append('estoque muito baixo')
    if E.get('vendas_30d_minimas') and (i.get('vendas_30d') or 0) < E['vendas_30d_minimas']: motivos.append(f'menos de {round(E["vendas_30d_minimas"]/30)} vendas/dia')
    if i.get('nota') and i['nota'] < E['nota_minima'] and (i.get('n_avaliacoes') or 0) >= 5: motivos.append('nota abaixo de 4,7')
    if E.get('categoria') and i.get('catid') and i['catid'] != E['categoria']: motivos.append('fora da categoria')
    if cfg.get('exige_termo') and not any(re.search(r'\b' + re.escape(norm(t)), nome_n) for t in cfg['exige_termo']): motivos.append('não é item de Natal')
    for p in cfg['palavras_proibidas']:
        if norm(p) and re.search(r'\b' + re.escape(norm(p)) + r'\b', nome_n): motivos.append(f'termo proibido: {p}'); break
    # ---- notas
    n = {}
    if comissao is None: n['comissao'] = 0.0
    elif comissao <= C['alvo']: n['comissao'] = C['nota_no_alvo'] * faixa(comissao, C['zero_em'], C['alvo'])
    else: n['comissao'] = C['nota_no_alvo'] + (1 - C['nota_no_alvo']) * faixa(comissao, C['alvo'], C['maximo_em'])
    lv = lambda k: math.log1p(i.get(k) or 0) if i.get(k) is not None else None
    conv = 0.35 * r_vendas(lv('vendas_30d')) + 0.15 * r_hist(lv('vendas_total')) + 0.2 * r_aval(lv('n_avaliacoes')) + 0.1 * r_curt(lv('curtidas'))
    if i.get('nota'): conv += 0.1 * faixa(i['nota'], 4.5, 5.0)
    if i.get('preco_antes') and preco and i['preco_antes'] > preco: conv += 0.05
    pmin, pmax = cfg['preco_preferido']
    if preco and pmin <= preco <= pmax: conv += 0.05
    n['conversao'] = min(1.0, conv)
    n['estoque'] = faixa(i.get('estoque'), S['zero_em'], S['cheio_em'])
    vend = 0.0
    if i.get('loja_nota'): vend += 0.7 * faixa(i['loja_nota'], 4.5, 5.0)
    if i.get('oficial') or i.get('preferido'): vend += 0.3
    n['vendedor'] = min(1.0, vend)
    n['video'] = min(1.0, (0.5 if i.get('tem_video') else 0.0) + 0.5 * faixa(i.get('n_fotos'), 3, 8))  # estimado; Claude refina ao revisar fotos
    rec = 0.0
    if dias is not None:
        for lim, v in cfg['recencia_dias']:
            if dias <= lim: rec = v; break
        piso = cfg['recencia_piso_se_vende_bem']
        if (i.get('vendas_30d') or 0) >= piso['vendas_30d_minimo']: rec = max(rec, piso['nota'])
    n['recencia'] = rec
    parecido = max((SequenceMatcher(None, nome_n[:80], u).ratio() for u in usados_nomes), default=0)
    n['diferenciacao'] = 1.0 if parecido < 0.5 else 0.5 if parecido < 0.7 else 0.0
    score = round(sum(P[k] * n[k] for k in P) * 100 / sum(P.values()))
    essenciais = ['preco_min', 'taxa_total', 'estoque', 'ctime', 'vendas_30d', 'nota']
    faltando = [k for k in essenciais if i.get(k) is None]
    confianca = round(100 * (1 - len(faltando) / len(essenciais)))
    if motivos: situacao = 'rejeitado'
    elif faltando: situacao = 'pendente'
    else: situacao = 'candidato'
    f = cfg['faixas']
    classe = 'Ouro' if score >= f['ouro'] else 'Prata' if score >= f['prata'] else 'Bronze' if score >= f['bronze'] else 'Baixa'
    # sem histórico de vendas não passa de Bronze 
    vmin = cfg.get('vendas_minimas_para_ouro_prata', {'mes': 10, 'total': 50})
    sem_vendas = (i.get('vendas_30d') or 0) < vmin['mes'] and (i.get('vendas_total') or 0) < vmin['total']
    if sem_vendas and classe in ('Ouro', 'Prata'):
        classe = 'Bronze'
    saida.append({
        'itemId': i['itemId'], 'shopId': i.get('shopId'), 'nome': i.get('nome'), 'busca': i.get('busca'),
        'preco': preco, 'preco_max': i.get('preco_max'), 'taxa_total': i.get('taxa_total'), 'taxa_xtra': i.get('taxa_xtra'),
        'comissao': comissao, 'estoque': i.get('estoque'), 'vendas_30d': i.get('vendas_30d'), 'vendas_total': i.get('vendas_total'),
        'dias': dias, 'nota': round(i['nota'], 2) if i.get('nota') else None, 'n_avaliacoes': i.get('n_avaliacoes'),
        'loja': i.get('loja'), 'loja_nota': round(i['loja_nota'], 2) if i.get('loja_nota') else None,
        'tem_video': i.get('tem_video'), 'n_fotos': i.get('n_fotos'),
        'link': i.get('link') or f"https://shopee.com.br/product/{i.get('shopId')}/{i['itemId']}",
        'notas': {k: round(v, 2) for k, v in n.items()}, 'score': score, 'classe': classe,
        'confianca': confianca, 'sem_vendas': sem_vendas, 'nao_verificado': faltando, 'situacao': situacao, 'motivos': motivos,
    })
saida.sort(key=lambda x: (x['situacao'] != 'candidato', -x['score']))
# rejeitados vão enxutos (a página tem limite de 256 KB por rodada)
CURTO = ('sem_vendas', 'vendas_30d', 'itemId', 'nome', 'situacao', 'motivos', 'score', 'classe', 'comissao', 'taxa_total', 'estoque', 'dias', 'link', 'notas', 'confianca', 'nao_verificado', 'n_fotos', 'tem_video', 'busca')
for x in saida:
    if x['situacao'] == 'rejeitado':
        for k in list(x):
            if k not in CURTO: del x[k]
        x['nome'] = (x['nome'] or '')[:90]
doc = {'geradoEm': time.strftime('%Y-%m-%d %H:%M'), 'pesos': P, 'itens': saida}
if '--pagina' in sys.argv:  # versão para a página: eliminados viram só um resumo de motivos
    from collections import Counter
    doc['eliminados'] = {'total': sum(1 for x in saida if x['situacao'] == 'rejeitado'),
                         'motivos': Counter(m.split(':')[0].split(' (')[0] for x in saida if x['situacao'] == 'rejeitado' for m in x['motivos']).most_common()}
    doc['itens'] = [x for x in saida if x['situacao'] != 'rejeitado']
txt = json.dumps(doc, ensure_ascii=False, separators=(',', ':'))
if len(txt.encode()) > 250000:
    sys.stderr.write('AVISO: rodada com mais de 250 KB - dividir a coleta em duas rodadas\n')
sys.stdout.reconfigure(encoding='utf-8')
sys.stdout.write(txt)
