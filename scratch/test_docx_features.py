import docx
from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

doc = Document()
sec = doc.sections[0]
footer = sec.footer
p = footer.paragraphs[0]
p.alignment = docx.enum.text.WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run()
ns = nsdecls("w")
xml_str = f'<w:fldSimple {ns} w:instr="PAGE"/>'
fld = parse_xml(xml_str)
run._r.append(fld)
doc.save('scratch/test_page_num.docx')
print('Successfully saved test_page_num.docx with dynamic page number!')
