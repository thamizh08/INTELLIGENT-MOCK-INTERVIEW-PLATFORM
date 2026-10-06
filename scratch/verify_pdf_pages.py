import pymupdf

doc = pymupdf.open('PBL_Report_Intelligent_Mock_Interview_Platform.pdf')
print(f"Total PDF pages: {len(doc)}")

for i in range(len(doc)):
    page = doc[i]
    text = page.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    footer = lines[-1] if lines else ''
    first = lines[0] if lines else ''
    print(f"Page {i+1:2d}: Top='{first[:40]:40s}' | Footer='{footer}'")
