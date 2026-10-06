with open('build_html_and_pdf.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

page_starts = []
for i, line in enumerate(lines):
    if line.startswith('# PAGE ') or (line.startswith('p') and '= f"""' in line) or (line.startswith('p') and '= """' in line):
        page_starts.append((i+1, line.strip()))

for item in page_starts:
    print(f"Line {item[0]:4d}: {item[1]}")
