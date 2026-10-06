import os
import sys
import subprocess
import base64

# Import page definitions
sys.path.append(os.path.abspath('scratch'))
from pages_frontmatter import get_frontmatter_pages
from pages_chapters1_3 import get_chapters1_3_pages
from pages_chapters4_5 import get_chapters4_5_pages
from pages_chapters6_8 import get_chapters6_8_pages

def build_standalone_script():
    front_pages = get_frontmatter_pages()
    c13_pages = get_chapters1_3_pages()
    c45_pages = get_chapters4_5_pages()
    c68_pages = get_chapters6_8_pages()

    all_raw_pages = front_pages + c13_pages + c45_pages + c68_pages
    print(f"Total pages collected: {len(all_raw_pages)}")

    def make_footer(page_num_str):
        return f"""
        <div class="page-footer" style="display: flex; justify-content: center; align-items: center; width: 100%; border-top: none; margin-top: auto; padding-top: 8px;">
            <span class="footer-page-num" style="font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; color: #111827;">{page_num_str}</span>
        </div>
        """

    def make_header(chapter_str):
        return ""

    header_replacements = {
        "@@HEADER_BAND_CH1@@": make_header("CHAPTER 1: INTRODUCTION"),
        "@@HEADER_BAND_CH2@@": make_header("CHAPTER 2: CONCEPT EXPLORATION"),
        "@@HEADER_BAND_CH3@@": make_header("CHAPTER 3: PROJECT PLANNING"),
        "@@HEADER_BAND_CH4@@": make_header("CHAPTER 4: ITERATIVE DESIGN"),
        "@@HEADER_BAND_CH5@@": make_header("CHAPTER 5: IMPLEMENTATION"),
        "@@HEADER_BAND_CH6@@": make_header("CHAPTER 6: RESULTS AND DISCUSSION"),
        "@@HEADER_BAND_CH7@@": make_header("CHAPTER 7: TEAM REFLECTIONS"),
        "@@HEADER_BAND_CH8@@": make_header("CHAPTER 8: CONCLUSION AND FUTURE SCOPE"),
        "@@HEADER_BAND_REFS@@": make_header("REFERENCES"),
        "@@HEADER_BAND_APP@@": make_header("APPENDIX"),
    }

    footer_replacements = {
        "@@FOOTER_I@@": make_footer("i"),
        "@@FOOTER_II@@": make_footer("ii"),
        "@@FOOTER_III@@": make_footer("iii"),
        "@@FOOTER_IV@@": make_footer("iv"),
        "@@FOOTER_V@@": make_footer("v"),
        "@@FOOTER_VI@@": make_footer("vi"),
        "@@FOOTER_VII@@": make_footer("vii"),
        "@@FOOTER_VIII@@": make_footer("viii"),
        "@@FOOTER_IX@@": make_footer("ix"),
        "@@FOOTER_X@@": make_footer("x"),
        "@@FOOTER_XI@@": make_footer("xi"),
        "@@FOOTER_XII@@": make_footer("xii"),
        "@@FOOTER_XIII@@": make_footer("xiii"),
        "@@FOOTER_XIV@@": make_footer("xiv"),
        "@@FOOTER_XV@@": make_footer("xv"),
        "@@FOOTER_XVI@@": make_footer("xvi"),
        "@@FOOTER_XVII@@": make_footer("xvii"),
    }
    for p_num in range(1, 35):
        footer_replacements[f"@@FOOTER_P{p_num}@@"] = make_footer(str(p_num))

    processed_pages = []
    for p in all_raw_pages:
        for k, v in header_replacements.items():
            p = p.replace(k, v)
        for k, v in footer_replacements.items():
            p = p.replace(k, v)
        processed_pages.append(p)

    def get_base64_img(path):
        if not os.path.exists(path):
            return ""
        with open(path, "rb") as f:
            data = f.read()
        ext = os.path.splitext(path)[1].lower().replace('.', '')
        if ext == 'jpg':
            ext = 'jpeg'
        return f"data:image/{ext};base64," + base64.b64encode(data).decode('utf-8')

    assets = {
        "@@CIT_LOGO@@": get_base64_img("docs/extracted_assets/img_xref_10_602x188.jpeg"),
        "@@ANNA_LOGO@@": get_base64_img("docs/extracted_assets/img_xref_8_191x183.jpeg"),
        "@@HEADER_BANNER@@": get_base64_img("docs/extracted_assets/img_xref_40_1264x124.jpeg"),
        "@@WATERMARK@@": get_base64_img("docs/extracted_assets/img_xref_46_387x113.jpeg"),
        "@@ARCH_DIAGRAM@@": get_base64_img("docs/architecture_diagram.png"),
        "@@STATE_MACHINE_DIAGRAM@@": get_base64_img("docs/state_machine_diagram.png"),
        "@@DATABASE_SCHEMA_DIAGRAM@@": get_base64_img("docs/database_schema_diagram.png"),
        "@@RADAR_REPORT_GRAPHIC@@": get_base64_img("docs/radar_report_graphic.png"),
        "@@ROADMAP_GRAPHIC@@": get_base64_img("docs/roadmap_graphic.png"),
        "@@PERFORMANCE_CHART@@": get_base64_img("docs/performance_chart.png"),
        "@@SC_5_1@@": get_base64_img("docs/screenshot_5_1.png"),
        "@@SC_5_2@@": get_base64_img("docs/screenshot_5_2.png"),
    }

    all_pages_html = "\n".join(processed_pages)
    for k, v in assets.items():
        all_pages_html = all_pages_html.replace(k, v)

    css_styles = """
@page {
    size: A4 portrait;
    margin: 0;
}
* {
    box-sizing: border-box;
}
body {
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, serif;
    color: #111827;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
.page {
    width: 210mm;
    height: 297mm;
    padding: 13mm 18mm 12mm 18mm;
    position: relative;
    page-break-after: always;
    overflow: hidden;
    background: #ffffff;
    box-sizing: border-box;
}
.page:last-child {
    page-break-after: avoid !important;
}
.cover-page {
    padding: 14mm 18mm 12mm 18mm;
}
.watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 165mm;
    height: auto;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
    opacity: 0.88;
}
.page-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    background: transparent !important;
}
.template-box {
    border: 2px solid #e07a22;
    border-radius: 12px;
    padding: 14px 18px;
    background: transparent !important;
}
/* No hindrance of text box: enforce transparent backgrounds on all boxes and tables */
.callout-card, table.pbl-table, table.pbl-table th, table.pbl-table td, table.pbl-table tr {
    background: transparent !important;
    background-color: transparent !important;
}
div:not(.do-not-transparent) {
    background-color: transparent !important;
}
.page-header-band {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1.5px solid #1e3a8a;
    padding-bottom: 3px;
    margin-bottom: 8px;
    font-size: 8.2pt;
    font-weight: bold;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.page-footer {
    width: 100%;
    border-top: 1px solid #94a3b8;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
    font-size: 8.2pt;
    color: #475569;
    margin-top: auto;
}
.footer-left { text-align: left; }
.footer-center { text-align: center; }
.footer-right { text-align: right; font-weight: bold; }

.page-logo-header {
    width: 100%;
    margin-bottom: 8px;
    text-align: center;
}
.page-logo-header img {
    width: 100%;
    max-height: 40px;
    object-fit: contain;
}

h1.doc-title {
    font-size: 19pt;
    font-weight: bold;
    text-align: center;
    margin: 8px 0;
    letter-spacing: 0.5px;
    color: #0f172a;
}
.chapter-title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    margin-top: 4px;
    margin-bottom: 2px;
    text-transform: uppercase;
    color: #0f172a;
}
.chapter-subtitle {
    font-size: 12pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    text-transform: uppercase;
    color: #1e3a8a;
}
.section-title {
    font-size: 11.2pt;
    font-weight: bold;
    margin-top: 9px;
    margin-bottom: 3px;
    color: #0f172a;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 2px;
}
.subsection-title {
    font-size: 10.4pt;
    font-weight: bold;
    margin-top: 7px;
    margin-bottom: 3px;
    color: #1e3a8a;
}
p {
    font-size: 10.1pt;
    line-height: 1.46;
    margin: 0 0 6px 0;
    color: #1e293b;
}
.justify-text {
    text-align: justify;
    text-justify: inter-word;
}
.center-text {
    text-align: center;
}
ul.bullet-list {
    margin: 0 0 6px 0;
    padding-left: 18px;
    font-size: 9.8pt;
    line-height: 1.42;
}
ul.bullet-list li {
    margin-bottom: 3.5px;
}
table.pbl-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    margin-bottom: 6px;
    font-size: 8.8pt;
}
table.pbl-table th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
    border: 1px solid #94a3b8;
    padding: 4px 6px;
    text-align: left;
}
table.pbl-table td {
    border: 1px solid #cbd5e1;
    padding: 3.8px 6px;
    vertical-align: top;
    color: #1e293b;
    line-height: 1.34;
}
table.pbl-table tr:nth-child(even) td {
    background-color: transparent !important;
}
.table-caption {
    font-size: 8.8pt;
    font-weight: bold;
    text-align: center;
    margin-top: 3px;
    margin-bottom: 4px;
    color: #334155;
}
.fig-caption {
    font-size: 8.8pt;
    font-weight: bold;
    text-align: center;
    margin-top: 3px;
    margin-bottom: 5px;
    color: #334155;
}
.callout-card {
    border: 1.5px solid #2563eb;
    border-radius: 6px;
    padding: 9px 13px;
    margin: 7px 0;
    background-color: transparent !important;
}
.code-block {
    background-color: #0f172a;
    color: #f8fafc;
    border-radius: 5px;
    padding: 7px 10px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 7.7pt;
    line-height: 1.25;
    margin: 4px 0 6px 0;
    white-space: pre-wrap;
    word-break: break-all;
    border: 1px solid #334155;
}
"""

    html_document = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PBL Report - Intelligent Mock Interview Platform</title>
<style>
{css_styles}
</style>
</head>
<body>
{all_pages_html}
</body>
</html>
"""

    html_path = os.path.abspath("docs/pbl_report_formatted.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_document)

    print(f"Successfully generated HTML with {len(processed_pages)} structured pages at: {html_path}")

    # Generate PDF via Chrome
    pdf_output_path = os.path.abspath("PBL_Report_Intelligent_Mock_Interview_Platform.pdf")
    cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_output_path}",
        html_path
    ]

    print("Rendering PDF via Google Chrome headless...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Chrome exited with code: {res.returncode}")

    if os.path.exists(pdf_output_path):
        size = os.path.getsize(pdf_output_path)
        print(f"Generated PDF at {pdf_output_path} ({size} bytes, {size/1024:.1f} KB)")
        
        import pymupdf
        doc = pymupdf.open(pdf_output_path)
        print(f"EXACT PDF PAGE COUNT: {len(doc)} pages")

        # If Chrome produced a blank trailing page, remove it
        if len(doc) > 43:
            last_page = doc[-1]
            if len(last_page.get_text().strip()) == 0:
                print(f"Removing empty trailing page {len(doc)}...")
                doc.delete_page(-1)
                doc.save(pdf_output_path, incremental=False)
                doc.close()
                doc = pymupdf.open(pdf_output_path)
                print(f"Final clean PDF page count: {len(doc)} pages")
        
        # Synchronize copies
        for alt in ["Intelligent_Mock_Interview_Platform_Report.pdf", "PBL_Report.pdf", "report.pdf"]:
            alt_path = os.path.abspath(alt)
            with open(pdf_output_path, "rb") as src, open(alt_path, "wb") as dst:
                dst.write(src.read())
            print(f"Synchronized copy to: {alt}")
    else:
        print(f"Error: PDF was not generated. Stderr: {res.stderr}")

if __name__ == "__main__":
    build_standalone_script()
