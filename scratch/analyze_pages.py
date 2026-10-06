import re
import os

with open('build_html_and_pdf.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Match page assignments like p1 = """...""" or p2 = f"""..."""
# Let's find all occurrences of pages.append(p...)
appended = re.findall(r'pages\.append\((p\d+)\)', code)
print(f'Total pages appended: {len(appended)}')

import pymupdf
doc = pymupdf.open('PBL_Report_Intelligent_Mock_Interview_Platform.pdf')
print(f'Total pages in PDF: {len(doc)}')

for i, page in enumerate(doc):
    rect = page.rect
    # compute vertical fill: where does the lowest text/drawing end?
    blocks = page.get_text('blocks')
    # each block: (x0, y0, x1, y1, text, block_no, block_type)
    lowest_y = 0
    for b in blocks:
        # ignore footer (footer is around y > 800)
        if b[3] < 800 and b[1] > 60:
            if b[3] > lowest_y:
                lowest_y = b[3]
    # Page height is 841.89 pt (A4). Usable height is roughly 60 to 790 (approx 730 pt)
    # fraction filled: (lowest_y - 60) / 730
    fill_pct = min(100.0, max(0.0, (lowest_y - 60) / 730 * 100))
    print(f'Page {i+1:2d}: lowest_y={lowest_y:6.1f} / 841.9 ({fill_pct:4.1f}% filled) | sample: {blocks[0][4][:40].strip() if blocks else "EMPTY"}')
