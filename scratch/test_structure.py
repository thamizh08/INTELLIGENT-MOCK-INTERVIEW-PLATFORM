import os, sys, re
sys.path.append('scratch')
import pages_chapters1_3 as c13
import pages_chapters4_5 as c45
import pages_chapters6_8 as c68

p13 = c13.get_chapters1_3_pages()
p45 = c45.get_chapters4_5_pages()
p68 = c68.get_chapters6_8_pages()

all_pages = p13 + p45 + p68
print(f"Total chapter pages: {len(all_pages)}")

for i, page in enumerate(all_pages, start=1):
    c_title = re.findall(r'class="chapter-title"[^>]*>(.*?)</div>', page)
    c_sub = re.findall(r'class="chapter-subtitle"[^>]*>(.*?)</div>', page)
    secs = re.findall(r'class="section-title"[^>]*>(.*?)</div>', page)
    subsecs = re.findall(r'class="subsection-title"[^>]*>(.*?)</div>', page)
    tbls = re.findall(r'<b>Table\s+([0-9A-Z\.]+):?</b>', page, re.IGNORECASE)
    figs = re.findall(r'<b>Figure\s+([0-9A-Z\.]+):?</b>', page, re.IGNORECASE)
    
    info = []
    if c_title: info.append(f"{c_title[0]} - {c_sub[0] if c_sub else ''}")
    if secs: info.extend([s.replace('&amp;', '&') for s in secs])
    if subsecs: info.extend([s.replace('&amp;', '&') for s in subsecs[:2]])
    if tbls: info.append(f"Tables: {tbls}")
    if figs: info.append(f"Figs: {figs}")
    print(f"Page {i:2d}: {' | '.join(info)}")
