"""Filtro automático de texto / marca d'água nas mídias de um produto (roda na nuvem).
Uso:  python -I filtro-texto.py <pasta-do-produto> [<outra-pasta> ...]
Lê com OCR (RapidOCR) cada foto e um quadro por segundo de cada vídeo e classifica:
  DESCARTAR  - plataforma/arroba/preço/promoção/link/texto chinês -> não usar
  REVISAR    - texto pequeno perto da borda (cara de logo) ou texto em inglês -> olhar com zoom
  INFO       - texto grande em português (infográfico do vendedor) -> pode usar inteira
  OK         - sem texto
Para vídeo, lista os trechos (segundos) sem DESCARTAR/REVISAR.
Instalar: pip install --break-system-packages rapidocr-onnxruntime opencv-python-headless
Limite: logo só em desenho (sem letras) não é detectado - a revisão visual continua."""
import sys, os, re, glob, json, unicodedata
import cv2
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()

PLATAFORMAS = r"tiktok|tik tok|kwai|douyin|aliexpress|alibaba|1688|mercado ?livre|mercadolivre|instagram|insta|shein|temu|amazon|magalu|americanas|youtube|facebook|whatsapp|shopee|xiaohongshu|taobao|pinduoduo|capcut"
PROMO = r"r\$|\bpromo|frete|desconto|oferta|% ?off|\boff\b|compre|cupom|liquida|queima|\bsale\b|gr[aá]tis|\bloja\b|\bstore\b|\bshop\b|\bofficial\b|oficial"
LINK = r"www\.|\.com|\.br\b|http"
LOGO_LOJA = r"(home|import\w*|store|decor|mart|shop|oficial|official|brasil|\bbr)$|^(loja|casa)\w{3,}$"
MARCAS = r"clorox|tide|\bomo\b|ype|yp[eê]|\bveja\b|brastemp|electrolux|tramontina|nespresso|dolce gusto|philips|mondial|britania|oster|arno|walita|tupperware|disney|stitch|marvel|barbie|hello kitty|nike|adidas|apple|samsung|xiaomi|ikea|coca|nestle|barilla|heinz"
INGLES = r"\b(the|and|with|for|your|easy|new|quality|design|product|free|best|size|color|use)\b"

def norm(s):
    return unicodedata.normalize('NFC', s).lower()

def cjk(s):
    return any('぀' <= c <= 'ヿ' or '一' <= c <= '鿿' or '가' <= c <= '힯' for c in s)

def analisa(img):
    h, w = img.shape[:2]
    res, _ = ocr(img)
    achados = []
    nivel = 'OK'
    rank = {'OK': 0, 'INFO': 1, 'REVISAR': 2, 'DESCARTAR': 3}
    for box, txt, conf in (res or []):
        conf = float(conf)
        if conf < 0.6 or len(txt.strip()) < 2:
            continue
        t = norm(txt)
        xs = [p[0] for p in box]; ys = [p[1] for p in box]
        bw, bh = max(xs) - min(xs), max(ys) - min(ys)
        cx, cy = (min(xs) + max(xs)) / 2 / w, (min(ys) + max(ys)) / 2 / h
        pequeno = bh < 0.035 * h
        borda = cx < 0.2 or cx > 0.8 or cy < 0.12 or cy > 0.88
        if '@' in t or re.search(PLATAFORMAS, t) or re.search(PROMO, t) or re.search(LINK, t) or cjk(txt):
            n = 'DESCARTAR'
        elif re.search(LOGO_LOJA, t.replace(' ', '')) and len(t.split()) <= 2:
            n = 'DESCARTAR'
        elif re.search(MARCAS, t):
            n = 'REVISAR'
        elif pequeno and borda:
            n = 'REVISAR'
        elif re.search(INGLES, t):
            n = 'REVISAR'
        else:
            n = 'INFO'
        achados.append(f'{n}: "{txt}"')
        if rank[n] > rank[nivel]:
            nivel = n
    return nivel, achados

def trechos(ok_segs, passo=1.0):
    out, ini = [], None
    for t, ok in ok_segs:
        if ok and ini is None: ini = t
        if not ok and ini is not None: out.append((ini, t)); ini = None
    if ini is not None: out.append((ini, ok_segs[-1][0] + passo))
    return [(a, b) for a, b in out if b - a >= 2]

relatorio = {}
for pasta in sys.argv[1:]:
    prod = os.path.basename(os.path.normpath(pasta))
    print(f'\n=== {prod} ===')
    relatorio[prod] = {}
    for f in sorted(glob.glob(os.path.join(pasta, '*'))):
        nome = os.path.basename(f)
        ext = nome.lower().rsplit('.', 1)[-1]
        if ext in ('jpg', 'jpeg', 'png', 'webp'):
            img = cv2.imread(f)
            if img is None: continue
            nivel, ach = analisa(img)
            relatorio[prod][nome] = {'nivel': nivel, 'textos': ach}
            print(f'{nivel:9} {nome}' + (f'  -> {"; ".join(ach[:4])}' if ach and nivel != 'OK' else ''))
        elif ext in ('mp4', 'mov', 'webm'):
            cap = cv2.VideoCapture(f)
            fps = cap.get(cv2.CAP_PROP_FPS) or 30
            dur = (cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0) / fps
            segs, ruins = [], []
            t = 0.0
            while t < dur:
                cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
                okr, fr = cap.read()
                if not okr: break
                nivel, ach = analisa(fr)
                segs.append((t, nivel in ('OK', 'INFO')))
                if nivel in ('DESCARTAR', 'REVISAR'): ruins.append(f'{t:.0f}s {nivel} {"; ".join(ach[:2])}')
                t += 1.0
            limpos = trechos(segs) if segs else []
            relatorio[prod][nome] = {'duracao': round(dur, 1), 'trechos_limpos': limpos, 'problemas': ruins}
            print(f'VIDEO     {nome} ({dur:.0f}s) trechos sem texto suspeito: ' + (', '.join(f'{a:.0f}-{b:.0f}s' for a, b in limpos) or 'nenhum'))
            for r in ruins[:6]: print('          ' + r)
json.dump(relatorio, open('filtro-texto-relatorio.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
