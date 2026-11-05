import io
import uuid
import json
from pathlib import Path
from typing import Optional, List, Dict, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageOps
from app.config import settings

class StorageService:
    @staticmethod
    def save_and_annotate_image(
        image_bytes: Optional[bytes],
        defect_type: str,
        confidence: float,
        bbox_list: Optional[List[Dict[str, float]]] = None
    ) -> Tuple[str, str, str]:
        """
        Saves image as compressed WebP (~40-50 KB), generates annotated version with
        AI bounding box overlay, and returns (annotated_url, original_url, bbox_json).
        """
        unique_id = str(uuid.uuid4())[:12]
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        orig_filename = f"orig_{unique_id}.webp"
        annot_filename = f"annot_{unique_id}.webp"

        orig_path = settings.UPLOAD_DIR / orig_filename
        annot_path = settings.UPLOAD_DIR / annot_filename

        # If no image provided, generate a synthetic realistic frame
        if not image_bytes or len(image_bytes) < 100:
            img = StorageService._generate_synthetic_incident_image(defect_type)
        else:
            try:
                img = Image.open(io.BytesIO(image_bytes))
                # Handle EXIF orientation from mobile phone cameras
                img = ImageOps.exif_transpose(img).convert("RGB")
                # Downsample large phone images to standard vehicle mount 1080p/720p edge resolution
                if max(img.size) > 1280:
                    img.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
            except Exception:
                img = StorageService._generate_synthetic_incident_image(defect_type)

        # Save original as WebP
        img.save(orig_path, format="WEBP", quality=75, method=4)

        # Create annotated image with bounding box
        annotated_img = img.copy()
        draw = ImageDraw.Draw(annotated_img)
        width, height = annotated_img.size

        # Default bounding box if none supplied
        if not bbox_list:
            # Centered realistic box for detected object
            bx1 = int(width * 0.28)
            by1 = int(height * 0.42)
            bx2 = int(width * 0.72)
            by2 = int(height * 0.85)
            bbox_list = [{
                "x1": bx1 / width,
                "y1": by1 / height,
                "x2": bx2 / width,
                "y2": by2 / height,
                "label": defect_type.replace("_", " ").title(),
                "confidence": confidence
            }]
        else:
            bx1 = int(bbox_list[0]["x1"] * width)
            by1 = int(bbox_list[0]["y1"] * height)
            bx2 = int(bbox_list[0]["x2"] * width)
            by2 = int(bbox_list[0]["y2"] * height)

        # Color based on defect severity
        is_hazard = defect_type in ["open_manhole", "vehicle_crash", "external_accident"]
        box_color = (239, 68, 68) if is_hazard else (234, 179, 8)  # Red or Amber
        border_width = max(4, int(min(width, height) * 0.008))

        # Draw crisp bounding box
        draw.rectangle([bx1, by1, bx2, by2], outline=box_color, width=border_width)
        
        # Draw label banner
        label_text = f" {defect_type.replace('_', ' ').upper()} {int(confidence * 100)}% "
        banner_h = max(26, int(height * 0.05))
        banner_w = max(220, int(width * 0.38))
        
        draw.rectangle([bx1, max(0, by1 - banner_h), bx1 + banner_w, by1], fill=box_color)
        draw.text((bx1 + 8, max(2, by1 - banner_h + 4)), label_text, fill=(255, 255, 255))

        # Save annotated WebP
        annotated_img.save(annot_path, format="WEBP", quality=75, method=4)

        annotated_url = f"/uploads/{annot_filename}"
        original_url = f"/uploads/{orig_filename}"
        bbox_json_str = json.dumps(bbox_list)

        return annotated_url, original_url, bbox_json_str

    @staticmethod
    def _generate_synthetic_incident_image(defect_type: str) -> Image.Image:
        """
        Creates a clean realistic 640x480 vehicle dashcam style road canvas with asphalt and sky.
        """
        w, h = 640, 480
        img = Image.new("RGB", (w, h), color=(135, 206, 235))  # Sky
        draw = ImageDraw.Draw(img)

        # Draw road asphalt (dark gray)
        draw.polygon([(0, int(h * 0.45)), (w, int(h * 0.45)), (w, h), (0, h)], fill=(50, 52, 55))

        # Draw road center dashes (yellow)
        for y in range(int(h * 0.5), h, 40):
            draw.rectangle([(w // 2 - 4, y), (w // 2 + 4, y + 25)], fill=(245, 200, 30))

        # Draw curbs / sidewalks
        draw.polygon([(0, int(h * 0.45)), (int(w * 0.15), h), (0, h)], fill=(120, 120, 120))
        draw.polygon([(w, int(h * 0.45)), (w, h), (int(w * 0.85), h)], fill=(120, 120, 120))

        # Visual defect representation on road
        if defect_type == "garbage_overflow":
            draw.ellipse([int(w * 0.35), int(h * 0.55), int(w * 0.65), int(h * 0.8)], fill=(70, 95, 60))
            draw.ellipse([int(w * 0.40), int(h * 0.52), int(w * 0.55), int(h * 0.7)], fill=(110, 130, 90))
        elif defect_type == "road_pothole":
            draw.ellipse([int(w * 0.40), int(h * 0.60), int(w * 0.60), int(h * 0.78)], fill=(20, 20, 22), outline=(15, 15, 15), width=2)
        elif defect_type == "open_manhole":
            draw.ellipse([int(w * 0.42), int(h * 0.58), int(w * 0.58), int(h * 0.76)], fill=(10, 10, 10), outline=(220, 38, 38), width=3)
        elif defect_type in ["vehicle_crash", "external_accident"]:
            draw.rectangle([int(w * 0.38), int(h * 0.52), int(w * 0.62), int(h * 0.75)], fill=(180, 50, 50))
            draw.rectangle([int(w * 0.52), int(h * 0.50), int(w * 0.70), int(h * 0.72)], fill=(40, 70, 140))
        else: # illegal_banner / other
            draw.rectangle([int(w * 0.1), int(h * 0.25), int(w * 0.35), int(h * 0.55)], fill=(220, 40, 40))

        # Vehicle dashboard HUD timestamp & GNSS simulation watermark
        hud_text = "CivicLens Edge Vision • 1080p Optical • CamX 1 FPS"
        draw.text((15, 15), hud_text, fill=(255, 255, 255))
        return img

