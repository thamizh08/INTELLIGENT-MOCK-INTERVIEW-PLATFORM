import os
import subprocess
import base64
import pymupdf

watermark_path = os.path.abspath('docs/extracted_assets/img_xref_46_387x113.jpeg')
with open(watermark_path, 'rb') as f:
    wm_b64 = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('utf-8')

test_html = f'''<!DOCTYPE html>
<html>
<head>
<style>
@page {{ size: A4 portrait; margin: 0; }}
body {{ margin: 0; padding: 0; font-family: 'Times New Roman', serif; }}
.page {{
    width: 210mm;
    height: 297mm;
    position: relative;
    page-break-after: always;
    overflow: hidden;
    padding: 20mm;
    box-sizing: border-box;
    background: #ffffff;
}}
.watermark {{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 158mm;
    height: auto;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
}}
.content {{
    position: relative;
    z-index: 1;
}}
</style>
</head>
<body>
<div class="page">
    <img src="{wm_b64}" class="watermark">
    <div class="content">
        <h1 style="color: #1e3a8a;">INTELLIGENT MOCK INTERVIEW PLATFORM</h1>
        <p style="font-size: 11pt; line-height: 1.5; color: #1e293b;">
            This is a test paragraph demonstrating how the watermark sits behind the page-filled contents.
            The exact SIRAGU watermark blends smoothly behind text and boxes using mix-blend-mode multiply.
        </p>
    </div>
</div>
</body>
</html>'''

with open('scratch/test_wm.html', 'w', encoding='utf-8') as f:
    f.write(test_html)

res = subprocess.run([
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--print-to-pdf=' + os.path.abspath('scratch/test_wm.pdf'),
    os.path.abspath('scratch/test_wm.html')
], capture_output=True, text=True)

print("Chrome exit code:", res.returncode)

doc = pymupdf.open('scratch/test_wm.pdf')
p = doc[0]
pix = p.get_pixmap(dpi=150)
pix.save('scratch/test_wm.png')
print('Rendered test_wm.png successfully')
