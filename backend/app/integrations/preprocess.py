import io
import base64
import re
from typing import Union, Optional
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

def decode_image_bytes(image_input: Union[str, bytes]) -> bytes:
    """
    Decodes an image from base64 string, data URI, or returns raw bytes.
    Handles padding and whitespaces safely.
    """
    if isinstance(image_input, bytes):
        return image_input
    
    if isinstance(image_input, str):
        # Handle data URI e.g. data:image/jpeg;base64,...
        if ',' in image_input:
            image_input = image_input.split(',', 1)[1]
        # Clean any whitespace, newlines, or quotes
        image_str = re.sub(r'[\s"\']+', '', image_input)
        # Fix missing base64 padding if truncated
        missing_padding = len(image_str) % 4
        if missing_padding:
            image_str += '=' * (4 - missing_padding)
        return base64.b64decode(image_str)
        
    raise ValueError("Invalid image input type. Expected bytes or str.")


def preprocess_image(image_input: Union[str, bytes, Image.Image]) -> Image.Image:
    """
    Pre-process receipt image for optimal OCR extraction with modern deep-learning engines:
    1. Safe base64 / bytes decoding
    2. EXIF orientation correction
    3. Transparent background compositing onto pure white RGB canvas
    4. Proportional resolution upscaling if image is low-res (< 800px)
    5. Preserves crisp, unblurred character strokes without destructive filtering
    """
    if isinstance(image_input, Image.Image):
        img = image_input.copy()
    else:
        raw_bytes = decode_image_bytes(image_input)
        img = Image.open(io.BytesIO(raw_bytes))
    
    # 1. Ensure correct orientation based on EXIF if present
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # 2. Handle transparency / alpha channels (RGBA, LA, P)
    # Composite onto pure white RGB background to avoid black text on black background
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        try:
            img = img.convert('RGBA')
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1])
            img = bg
        except Exception:
            img = img.convert('RGB')
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # 3. Upscale low-resolution images so text features are well-defined for neural OCR
    w, h = img.size
    min_dim = min(w, h)
    if min_dim < 700:
        scale = max(1.5, 900.0 / min_dim)
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    return img


def image_to_bytes(img: Image.Image, format: str = "PNG") -> bytes:
    """
    Converts a PIL Image back to bytes.
    """
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

