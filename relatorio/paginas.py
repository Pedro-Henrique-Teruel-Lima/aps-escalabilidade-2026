# paginas.py — localiza a pagina de cada titulo no PDF e grava out/toc.json
import json, re, sys, unicodedata, pypdf
def norm(s):
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', '', s).lower()
r = pypdf.PdfReader('out/relatorio.pdf')
pages = [norm(p.extract_text() or '') for p in r.pages]
heads = json.load(open('out/heads.json', encoding='utf-8'))
toc, miss = {}, []
for h in heads:
    k = norm(h)
    hit = [i + 1 for i, t in enumerate(pages) if k in t]
    if hit: toc[h] = hit[-1]
    else: miss.append(h)
json.dump(toc, open('out/toc.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('paginas:', len(pages), 'faltando:', miss)
for h in heads:
    if re.match(r'^\d+ ', h): print(toc.get(h), h)
