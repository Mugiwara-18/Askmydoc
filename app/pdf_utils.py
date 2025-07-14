import pdfplumber
from PIL import Image
import os

def extract_text_from_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)

def extract_images_from_pdf(file_path):
    image_paths = []
    os.makedirs("temp_images", exist_ok=True)

    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            im = page.to_image(resolution=300)  # PageImage
            for j, img in enumerate(page.images):
                bbox = (img['x0'], img['top'], img['x1'], img['bottom'])

                cropped = im.original.crop((
                    int(bbox[0] * im.scale),
                    int(bbox[1] * im.scale),
                    int(bbox[2] * im.scale),
                    int(bbox[3] * im.scale)
                ))

                out_path = f"temp_images/image_{i}_{j}.png"
                cropped.save(out_path)
                image_paths.append(out_path)

    return image_paths
