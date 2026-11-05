import logging
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.models.incident import Incident, DefectType, UrgencyLevel

logger = logging.getLogger(__name__)

# Section 5.3 Dispatch Matrix
DISPATCH_MATRIX: Dict[str, Dict[str, str]] = {
    DefectType.VEHICLE_CRASH.value: {
        "title": "Vehicle Collision / Rollover Hazard",
        "department": "Traffic Police & Emergency Medical (108)",
        "channel_sla": "Direct Webhook / SMS Dispatch (< 5 seconds)",
        "urgency": UrgencyLevel.URGENT_SAFETY.value,
        "default_landmark": "Bypass Flyover Descent"
    },
    DefectType.EXTERNAL_ACCIDENT.value: {
        "title": "Roadside Accident Detected",
        "department": "Traffic Police & Emergency Medical (108)",
        "channel_sla": "Direct Webhook / SMS Dispatch (< 5 seconds)",
        "urgency": UrgencyLevel.URGENT_SAFETY.value,
        "default_landmark": "National Highway Junction"
    },
    DefectType.OPEN_MANHOLE.value: {
        "title": "Open Manhole Hazard",
        "department": "Water Supply & Sewerage Board",
        "channel_sla": "Emergency Dispatch Bot (< 15 minutes)",
        "urgency": UrgencyLevel.URGENT_SAFETY.value,
        "default_landmark": "Station Road Junction"
    },
    DefectType.GARBAGE_OVERFLOW.value: {
        "title": "Garbage Overflow / Blackspot",
        "department": "Public Health & Sanitation",
        "channel_sla": "Ward Sanitary Inspector Telegram Bot (< 2 hours)",
        "urgency": UrgencyLevel.SANITATION_ROADS.value,
        "default_landmark": "Main Market Road, Pillar 42"
    },
    DefectType.ROAD_POTHOLE.value: {
        "title": "Severe Road Pothole / Cave-in",
        "department": "Roads & PWD Civil Wing",
        "channel_sla": "Municipal Work Order Queue (48 hours)",
        "urgency": UrgencyLevel.SANITATION_ROADS.value,
        "default_landmark": "Beach Road Sector 4"
    },
    DefectType.ILLEGAL_BANNER.value: {
        "title": "Illegal Encroachment / Hoarding",
        "department": "Town Planning & Advertisement Enforcement",
        "channel_sla": "Enforcement Squad Queue (< 24 hours)",
        "urgency": UrgencyLevel.SANITATION_ROADS.value,
        "default_landmark": "RTC Complex Circle"
    },
    DefectType.FLEET_OVERSPEED.value: {
        "title": "Fleet Driver Overspeeding Event",
        "department": "Transit / Fleet Depot Management",
        "channel_sla": "Daily Driver Performance Audit",
        "urgency": UrgencyLevel.ROUTINE.value,
        "default_landmark": "BRTS Corridor North"
    }
}

class DispatchService:
    @staticmethod
    def get_routing_info(defect_type: str) -> Dict[str, str]:
        return DISPATCH_MATRIX.get(
            defect_type,
            {
                "title": f"Civic Issue: {defect_type.replace('_', ' ').title()}",
                "department": "Municipal Grievance Cell",
                "channel_sla": "Standard Protocol (< 24 hours)",
                "urgency": UrgencyLevel.SANITATION_ROADS.value,
                "default_landmark": "Ward Central Junction"
            }
        )

    @staticmethod
    async def dispatch_telegram_alert(incident: Incident, custom_chat_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Dispatches formatted incident card with proof image to departmental Telegram channel.
        Section 2 & 5.3: Sub-second officer push notifications with inline proof snapshots.
        """
        token = settings.TELEGRAM_BOT_TOKEN
        chat_id = custom_chat_id or settings.TELEGRAM_DEFAULT_CHAT_ID

        # Format emoji based on urgency
        emoji = "🚨" if incident.urgency == UrgencyLevel.URGENT_SAFETY.value else "⚠️"
        
        maps_link = f"https://www.google.com/maps?q={incident.latitude:.6f},{incident.longitude:.6f}"
        
        message_text = (
            f"{emoji} *CIVICLENS DISPATCH NOTICE* {emoji}\n\n"
            f"*Issue:* {incident.title}\n"
            f"*Ward:* {incident.ward_name or incident.ward_id} ({incident.zone_id or 'Zone 3'})\n"
            f"*Urgency:* `{incident.urgency}`\n"
            f"*Target Department:* {incident.assigned_department}\n"
            f"*SLA Window:* {incident.channel_sla}\n\n"
            f"📍 *Coordinates:* `{incident.latitude:.5f}, {incident.longitude:.5f}`\n"
            f"📌 *Landmark:* {incident.landmark or 'Designated Route'}\n"
            f"🎯 *Vision Confidence:* {int(incident.confidence * 100)}%\n"
            f"🚗 *Spotted By:* {incident.spotted_by_label} (Total sightings: {incident.sighting_count})\n\n"
            f"🧠 *AI Context (On-Device SLM):*\n"
            f"_{incident.slm_summary or 'Positive detection confirmed.'}_\n\n"
            f"🗺 [View Location on Google Maps]({maps_link})\n"
            f"⚡ *Ticket ID:* `{incident.id}`"
        )

        if not token or not chat_id:
            logger.info("Telegram Bot Token or Chat ID not configured. Operating in SIMULATED dispatch mode.")
            return {
                "success": True,
                "mode": "simulated",
                "dispatched_at": datetime.utcnow().isoformat(),
                "channel": incident.assigned_department,
                "message_preview": message_text
            }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # If image exists on disk, send photo with caption
                if incident.image_url and settings.UPLOAD_DIR.exists():
                    image_filename = incident.image_url.split("/")[-1]
                    image_path = settings.UPLOAD_DIR / image_filename
                    if image_path.exists():
                        with open(image_path, "rb") as photo_file:
                            resp = await client.post(
                                f"https://api.telegram.org/bot{token}/sendPhoto",
                                data={
                                    "chat_id": chat_id,
                                    "caption": message_text,
                                    "parse_mode": "Markdown"
                                },
                                files={"photo": photo_file}
                            )
                            resp.raise_for_status()
                            data = resp.json()
                            return {
                                "success": True,
                                "mode": "telegram_api",
                                "message_id": data.get("result", {}).get("message_id"),
                                "dispatched_at": datetime.utcnow().isoformat()
                            }

                # Fallback to text message
                resp = await client.post(
                    f"https://api.telegram.org/bot{token}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": message_text,
                        "parse_mode": "Markdown"
                    }
                )
                resp.raise_for_status()
                data = resp.json()
                return {
                    "success": True,
                    "mode": "telegram_api",
                    "message_id": data.get("result", {}).get("message_id"),
                    "dispatched_at": datetime.utcnow().isoformat()
                }
        except Exception as e:
            logger.warning(f"Telegram dispatch failed: {e}. Falling back to simulation record.")
            return {
                "success": False,
                "mode": "fallback_simulated",
                "error": str(e),
                "dispatched_at": datetime.utcnow().isoformat()
            }

