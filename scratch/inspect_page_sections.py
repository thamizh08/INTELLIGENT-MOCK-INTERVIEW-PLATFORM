import re

with open('build_html_and_pdf.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find each page definition p1 = ... up to pages.append
pattern = r'(p\d+)\s*=\s*(?:f?"""|""")([\s\S]*?)"""'
matches = re.findall(pattern, content)

print(f"Total matched pages: {len(matches)}")
for name, body in matches:
    # find all headings inside body
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', body, re.IGNORECASE)
    h2 = re.findall(r'<h2[^>]*>(.*?)</h2>', body, re.IGNORECASE)
    sec = re.findall(r'class="section-title"[^>]*>(.*?)<', body)
    subsec = re.findall(r'class="subsection-title"[^>]*>(.*?)<', body)
    
    headings = []
    if h1: headings.extend([f"H1:{h.strip()}" for h in h1])
    if h2: headings.extend([f"H2:{h.strip()}" for h in h2])
    if sec: headings.extend([f"Sec:{s.strip()}" for s in sec])
    if subsec: headings.extend([f"Sub:{s.strip()}" for s in subsec])
    
    # strip HTML tags to get pure text length
    text_only = re.sub(r'<[^>]+>', ' ', body)
    text_only = re.sub(r'\s+', ' ', text_only).strip()
    words = len(text_only.split())
    
    print(f"{name:4s}: {words:4d} words | {', '.join(headings[:3])}")
