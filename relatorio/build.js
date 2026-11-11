// build.js — gera relatorio.docx (editavel) e relatorio.html (base do PDF)
// uso: node build.js docx|html
const fs = require('fs');
const path = require('path');
const { blocks } = require('./content.js');
const { extra } = require('./extra.js');
const all = [...blocks, ...extra];
const mode = process.argv[2] || 'docx';
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const TITULO = 'ENGENHARIA DE ESCALABILIDADE HORIZONTAL VS. VERTICAL SOB RESTRIÇÃO DE RECURSOS';
const FONTE = 'Fonte: elaborado pelos autores (2026).';
const parseInline = (s) => s.split(/(\*\*.+?\*\*)/).filter(Boolean).map((p) => (p.startsWith('**') ? { text: p.slice(2, -2), bold: true } : { text: p }));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inlineHtml = (s) => parseInline(s).map((r) => (r.bold ? `<b>${esc(r.text)}</b>` : esc(r.text))).join('');

const fichaAtividades = [
  'Leitura e análise do enunciado, do regulamento e do kit base',
  'Análise do código do monolito, do gerador de carga e do avaliador',
  'Execução e medição do Cenário A (baseline)',
  'Diagnóstico dos gargalos do baseline',
  'Projeto da arquitetura distribuída (Cenário B)',
  'Implementação do docker-compose.distribuido.yaml',
  'Execução e ajuste do Cenário B (sem e com réplica) e coleta de docker stats',
  'Elaboração da matriz comparativa de testes',
  'Redação do relatório técnico e preparação da apresentação',
  '',
];

// ============================ HTML / PDF ============================
function buildHtml() {
  let toc = {};
  try { toc = JSON.parse(fs.readFileSync(path.join(OUT, 'toc.json'), 'utf8')); } catch (e) {}
  const heads = all.filter((b) => b.t === 'h1' || b.t === 'h2');
  const tocHtml = heads.map((h) => `<div class="toc ${h.t}"><span>${esc(h.x)}</span><span class="dots"></span><span class="pg">${toc[h.x] || '00'}</span></div>`).join('\n');
  const css = `
@page { size: A4; margin: 3cm 2.5cm 2cm 2.5cm; @bottom-right { content: counter(page); font: 12pt Arial, sans-serif; } }
@page cover { size: A4; margin: 3cm 2.5cm 2cm 2.5cm; @bottom-right { content: none; } }
html { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; }
body { margin: 0; line-height: 1.5; text-align: justify; }
p { margin: 0; text-indent: 1.25cm; }
h1 { font-size: 12pt; font-weight: bold; margin: 0 0 12pt 0; page-break-before: always; break-after: avoid; text-align: left; }
h2 { font-size: 12pt; font-weight: bold; margin: 12pt 0 6pt 0; break-after: avoid; text-align: left; }
ul, ol { margin: 0 0 0 1.25cm; padding-left: 0.6cm; }
li { margin: 0; }
.cover { page: cover; page-break-after: always; text-align: center; line-height: 1.2; height: 24.5cm; position: relative; }
.cover .end { position: absolute; bottom: 0; left: 0; right: 0; }
.cover table { margin: 1.2cm auto; width: 14cm; }
.toc { display: flex; line-height: 1.2; margin: 3pt 0; text-align: left; }
.toc.h2 { padding-left: 1cm; }
.toc .dots { flex: 1; border-bottom: 1px dotted #000; margin: 0 4px 4px 4px; }
.cap { text-indent: 0; font-size: 11pt; font-weight: bold; margin: 12pt 0 4pt 0; line-height: 1.2; break-after: avoid; text-align: left; }
.src { text-indent: 0; font-size: 10pt; margin: 4pt 0 12pt 0; line-height: 1.2; text-align: left; }
table.t { border-collapse: collapse; width: 100%; font-size: 10pt; line-height: 1.2; text-align: left; }
table.t td, table.t th { border: 1px solid #000; padding: 3pt 5pt; vertical-align: top; }
table.t th { background: #d9d9d9; }
table.t tr { break-inside: avoid; }
.fig { text-align: center; text-indent: 0; margin: 0; break-inside: avoid; }
.fig img { width: 16cm; }
.shot { border: 1.5px dashed #777; height: 6.5cm; display: flex; align-items: center; justify-content: center; color: #777; font-size: 11pt; text-indent: 0; }
pre { font-family: 'Courier New', monospace; font-size: 8.5pt; line-height: 1.1; text-align: left; white-space: pre-wrap; margin: 0; }
.ref { text-indent: 0; line-height: 1.2; margin: 0 0 12pt 0; text-align: left; }
.ficha { font-size: 10pt; line-height: 1.3; text-align: left; }
.ficha p { text-indent: 0; }
.ficha table { width: 100%; border-collapse: collapse; margin: 6pt 0; }
.ficha td, .ficha th { border: 1px solid #000; padding: 4pt; vertical-align: top; font-size: 9pt; }
.ficha th { background: #d9d9d9; }
`;
  let body = '';
  body += `<div class="cover">
<div style="font-size:11pt"><b>UNIVERSIDADE PAULISTA – UNIP</b><br>Av. Alberto Benassi, 200 - Parque das Laranjeiras - Araraquara - SP<br>CEP 14804-300 - Tel.: (16) 3336-1800</div>
<div style="margin-top:2cm;font-size:14pt;font-weight:bold">ATIVIDADES PRÁTICAS SUPERVISIONADAS</div>
<div style="margin-top:1cm;font-weight:bold">${esc(TITULO)}</div>
<table class="t"><tr><th style="width:75%">NOME</th><th>RA</th></tr>${'<tr><td>&nbsp;<br>&nbsp;</td><td></td></tr>'.repeat(5)}</table>
<div class="end"><div style="margin-left:7cm;text-align:justify;font-size:11pt;margin-bottom:1.5cm">Atividades Práticas Supervisionadas, apresentada à UNIP – Campus Araraquara/SP, referente ao 7º/8º Semestres, como parte dos requisitos para avaliação semestral, no Curso de Ciência da Computação.</div><b>ARARAQUARA/SP<br>2026</b></div>
</div>`;
  body += `<div style="font-weight:bold;text-align:center;margin-bottom:12pt">ÍNDICE</div>${tocHtml}`;
  for (const b of all) {
    if (b.t === 'h1') body += `<h1>${esc(b.x)}</h1>`;
    else if (b.t === 'h2') body += `<h2>${esc(b.x)}</h2>`;
    else if (b.t === 'p') body += `<p>${inlineHtml(b.x)}</p>`;
    else if (b.t === 'ul') body += `<ul>${b.x.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ul>`;
    else if (b.t === 'ol') body += `<ol>${b.x.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ol>`;
    else if (b.t === 'code') body += `<pre>${esc(b.x)}</pre>`;
    else if (b.t === 'table') {
      body += `<p class="cap">${esc(b.caption)}</p><table class="t"><colgroup>${b.widths.map((w) => `<col style="width:${w}%">`).join('')}</colgroup><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c) || '&nbsp;'}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="src">${FONTE}</p>`;
    } else if (b.t === 'fig') {
      body += `<p class="cap">${esc(b.caption)}</p><p class="fig"><img src="../${b.file}" style="width:${b.w}cm"></p><p class="src">${FONTE}</p>`;
    } else if (b.t === 'shot') {
      body += `<p class="cap">${esc(b.caption)}</p><div class="shot">[ inserir captura de tela aqui ]</div><p class="src">${FONTE}</p>`;
    } else if (b.t === 'refs') {
      body += b.x.map((r) => `<p class="ref">${inlineHtml(r)}</p>`).join('');
    } else if (b.t === 'ficha') {
      body += `<div class="ficha"><p style="text-align:center;font-weight:bold;font-size:12pt">FICHA DAS ATIVIDADES PRÁTICAS SUPERVISIONADAS - APS</p>
<p>NOME: ______________________________________________ TURMA: __________ RA: ______________</p>
<p>CURSO: Ciência da Computação &nbsp; CAMPUS: Araraquara &nbsp; SEMESTRE: ______ &nbsp; TURNO: ________</p>
<p>CÓDIGO DA ATIVIDADE: ____________________ SEMESTRE: ________ ANO GRADE: ____________</p>
<table><tr><th style="width:12%">DATA DA ATIVIDADE</th><th>DESCRIÇÃO DA ATIVIDADE</th><th style="width:16%">ASSINATURA DO ALUNO</th><th style="width:10%">HORAS ATRIBUÍDAS (1)</th><th style="width:16%">ASSINATURA DO PROFESSOR</th></tr>${fichaAtividades.map((a) => `<tr><td>&nbsp;<br>&nbsp;</td><td>${esc(a)}</td><td></td><td></td><td></td></tr>`).join('')}</table>
<p>(1) Horas atribuídas de acordo com o regulamento das Atividades Práticas Supervisionadas do curso.</p>
<p>TOTAL DE HORAS ATRIBUÍDAS: ____________ &nbsp; AVALIAÇÃO (Aprovado ou Reprovado): ____________ &nbsp; NOTA: ________ &nbsp; DATA: ____/____/________</p>
<p>CARIMBO E ASSINATURA DO COORDENADOR DO CURSO: ______________________________________</p></div>`;
    }
  }
  fs.writeFileSync(path.join(OUT, 'relatorio.html'), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>APS 2026 - Escalabilidade</title><style>${css}</style></head><body>${body}</body></html>`);
  console.log('html ok');
}

// ============================ DOCX ============================
async function buildDocx() {
  const D = require('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun, Footer, PageNumber, TableOfContents, LevelFormat, HeightRule } = D;
  const W = 9072; // largura util em DXA (A4 - 2 x 2,5 cm)
  const line15 = { line: 360, lineRule: 'auto', before: 0, after: 0 };
  const line1 = { line: 240, lineRule: 'auto', before: 0, after: 0 };
  const runs = (s, o = {}) => parseInline(s).map((r) => new TextRun({ text: r.text, bold: r.bold || o.bold, size: o.size, font: o.font }));
  const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text, w, o = {}) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: o.borders || borders,
    shading: o.head ? { type: ShadingType.CLEAR, fill: 'D9D9D9', color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [new Paragraph({ spacing: line1, alignment: AlignmentType.LEFT, children: [new TextRun({ text: text || '', bold: !!o.head, size: o.size || 20 })] })],
  });
  const caption = (t) => new Paragraph({ spacing: { line: 240, before: 240, after: 80 }, keepNext: true, children: [new TextRun({ text: t, bold: true, size: 22 })] });
  const source = () => new Paragraph({ spacing: { line: 240, before: 80, after: 240 }, children: [new TextRun({ text: FONTE, size: 20 })] });
  const out = [];

  // capa
  const cover = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: line1, children: [new TextRun({ text: 'UNIVERSIDADE PAULISTA – UNIP', bold: true, size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: line1, children: [new TextRun({ text: 'Av. Alberto Benassi, 200 - Parque das Laranjeiras - Araraquara - SP', size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: line1, children: [new TextRun({ text: 'CEP 14804-300 - Tel.: (16) 3336-1800', size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240, before: 1200, after: 0 }, children: [new TextRun({ text: 'ATIVIDADES PRÁTICAS SUPERVISIONADAS', bold: true, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 276, before: 600, after: 600 }, children: [new TextRun({ text: TITULO, bold: true, size: 24 })] }),
    new Table({
      width: { size: 8000, type: WidthType.DXA }, columnWidths: [6000, 2000], alignment: AlignmentType.CENTER,
      rows: [new TableRow({ children: [cell('NOME', 6000, { head: true }), cell('RA', 2000, { head: true })] }),
        ...Array.from({ length: 5 }, () => new TableRow({ height: { value: 640, rule: HeightRule.AT_LEAST }, children: [cell('', 6000), cell('', 2000)] }))],
    }),
    new Paragraph({ spacing: { line: 240, before: 1500, after: 0 }, indent: { left: 3900 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: 'Atividades Práticas Supervisionadas, apresentada à UNIP – Campus Araraquara/SP, referente ao 7º/8º Semestres, como parte dos requisitos para avaliação semestral, no Curso de Ciência da Computação.', size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240, before: 1200, after: 0 }, children: [new TextRun({ text: 'ARARAQUARA/SP', bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: line1, children: [new TextRun({ text: '2026', bold: true })] }),
  ];

  // corpo
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360, after: 240 }, children: [new TextRun({ text: 'ÍNDICE', bold: true })] }));
  out.push(new TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-2' }));

  for (const b of all) {
    if (b.t === 'h1') out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(b.x)] }));
    else if (b.t === 'h2') out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(b.x)] }));
    else if (b.t === 'p') out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 709 }, spacing: line15, children: runs(b.x) }));
    else if (b.t === 'ul') b.x.forEach((i) => out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, numbering: { reference: 'bul', level: 0 }, spacing: line15, children: runs(i) })));
    else if (b.t === 'ol') b.x.forEach((i) => out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, numbering: { reference: 'ol', level: 0 }, spacing: line15, children: runs(i) })));
    else if (b.t === 'code') b.x.split('\n').forEach((l) => out.push(new Paragraph({ spacing: line1, alignment: AlignmentType.LEFT, children: [new TextRun({ text: l === '' ? ' ' : l, font: 'Courier New', size: 17 })] })));
    else if (b.t === 'table') {
      const cw = b.widths.map((p) => Math.round((W * p) / 100));
      cw[cw.length - 1] += W - cw.reduce((a, c) => a + c, 0);
      out.push(caption(b.caption));
      out.push(new Table({
        width: { size: W, type: WidthType.DXA }, columnWidths: cw,
        rows: [new TableRow({ tableHeader: true, children: b.head.map((h, i) => cell(h, cw[i], { head: true })) }),
          ...b.rows.map((r) => new TableRow({ cantSplit: true, height: { value: r.every((c) => c === '') ? 560 : 300, rule: HeightRule.AT_LEAST }, children: r.map((c, i) => cell(c, cw[i])) }))],
      }));
      out.push(source());
    } else if (b.t === 'fig') {
      const px = Math.round((b.w / 2.54) * 96), py = Math.round((b.h / 2.54) * 96);
      out.push(caption(b.caption));
      out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: line1, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(__dirname, b.file)), transformation: { width: px, height: py }, altText: { title: b.caption, description: b.caption, name: b.file } })] }));
      out.push(source());
    } else if (b.t === 'shot') {
      const dash = { style: BorderStyle.DASHED, size: 8, color: '777777' };
      out.push(caption(b.caption));
      out.push(new Table({
        width: { size: W, type: WidthType.DXA }, columnWidths: [W],
        rows: [new TableRow({ height: { value: 3600, rule: HeightRule.AT_LEAST }, children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: { top: dash, bottom: dash, left: dash, right: dash }, verticalAlign: D.VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: line1, children: [new TextRun({ text: '[ inserir captura de tela aqui ]', color: '777777', size: 22 })] })] })] })],
      }));
      out.push(source());
    } else if (b.t === 'refs') {
      b.x.forEach((r) => out.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 240, after: 240 }, children: runs(r) })));
    } else if (b.t === 'ficha') {
      const fl = (t, o = {}) => new Paragraph({ spacing: { line: 300, after: 80 }, alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: t, size: o.size || 20, bold: o.bold })] });
      out.push(fl('FICHA DAS ATIVIDADES PRÁTICAS SUPERVISIONADAS - APS', { center: true, bold: true, size: 24 }));
      out.push(fl('NOME: ______________________________________________ TURMA: __________ RA: ______________'));
      out.push(fl('CURSO: Ciência da Computação    CAMPUS: Araraquara    SEMESTRE: ______    TURNO: ________'));
      out.push(fl('CÓDIGO DA ATIVIDADE: ____________________   SEMESTRE: ________   ANO GRADE: ____________'));
      const cw = [1200, 3672, 1500, 900, 1800];
      out.push(new Table({
        width: { size: W, type: WidthType.DXA }, columnWidths: cw,
        rows: [new TableRow({ children: ['DATA DA ATIVIDADE', 'DESCRIÇÃO DA ATIVIDADE', 'ASSINATURA DO ALUNO', 'HORAS ATRIBUÍDAS (1)', 'ASSINATURA DO PROFESSOR'].map((h, i) => cell(h, cw[i], { head: true, size: 18 })) }),
          ...fichaAtividades.map((a) => new TableRow({ height: { value: 560, rule: HeightRule.AT_LEAST }, children: [cell('', cw[0], { size: 18 }), cell(a, cw[1], { size: 18 }), cell('', cw[2]), cell('', cw[3]), cell('', cw[4])] }))],
      }));
      out.push(fl('(1) Horas atribuídas de acordo com o regulamento das Atividades Práticas Supervisionadas do curso.', { size: 18 }));
      out.push(fl('TOTAL DE HORAS ATRIBUÍDAS: ____________   AVALIAÇÃO (Aprovado ou Reprovado): ____________   NOTA: ________   DATA: ____/____/________'));
      out.push(fl('CARIMBO E ASSINATURA DO COORDENADOR DO CURSO: ______________________________________'));
    }
  }

  const page = (extraP = {}) => ({ page: { size: { width: 11906, height: 16838 }, margin: { top: 1701, bottom: 1134, left: 1417, right: 1417 }, ...extraP } });
  const doc = new Document({
    creator: 'Equipe APS', title: 'APS 2026 - Escalabilidade horizontal vs. vertical', features: { updateFields: true },
    styles: {
      default: { document: { run: { font: 'Arial', size: 24 }, paragraph: { spacing: line15 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 24, bold: true }, paragraph: { spacing: { before: 0, after: 240, line: 360 }, keepNext: true, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 24, bold: true }, paragraph: { spacing: { before: 240, after: 120, line: 360 }, keepNext: true, outlineLevel: 1 } },
        { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal', run: { font: 'Arial', size: 24 }, paragraph: { spacing: { before: 40, after: 40, line: 276 } } },
        { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Arial', size: 24 }, paragraph: { spacing: { before: 0, after: 0, line: 276 }, indent: { left: 400 } } },
      ],
    },
    numbering: {
      config: [
        { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1069, hanging: 360 } } } }] },
        { reference: 'ol', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1069, hanging: 360 } } } }] },
      ],
    },
    sections: [
      { properties: page(), children: cover },
      { properties: page({ pageNumbers: { start: 2 } }), footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] }) }, children: out },
    ],
  });
  fs.writeFileSync(path.join(OUT, 'relatorio.docx'), await Packer.toBuffer(doc));
  console.log('docx ok');
}

if (mode === 'html') buildHtml();
else buildDocx();
