import pymupdf

doc = pymupdf.open('PBL_Report_Intelligent_Mock_Interview_Platform.pdf')
print(f"Total Pages: {len(doc)}")

watermark_count = 0
for i in range(len(doc)):
    page = doc[i]
    imgs = page.get_images()
    # Check if page has images
    # Watermark image width is 387, height is 113
    has_wm = any(img[2] == 387 and img[3] == 113 for img in imgs)
    if has_wm:
        watermark_count += 1
    else:
        print(f"Page {i+1} MISSING watermark! Images found: {[(img[2], img[3]) for img in imgs]}")

print(f"Total pages with exact SIRAGU watermark: {watermark_count} / {len(doc)}")
