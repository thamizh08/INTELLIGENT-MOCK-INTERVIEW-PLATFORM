import pymupdf

doc = pymupdf.open('PBL_Report_Intelligent_Mock_Interview_Platform.pdf')
print("Total Pages:", len(doc))

for i in range(7):
    p = doc[i]
    print(f"\n================ PAGE {i+1} ================")
    text = p.get_text()
    for line in text.split('\n'):
        if line.strip():
            print("  ", line.strip())
    # Save pixmap to inspect visually
    pix = p.get_pixmap(dpi=150)
    pix.save(f'scratch/page_renders/new_p{i+1}.png')
print("\nSaved page screenshots to scratch/page_renders/new_p1.png through new_p7.png")
