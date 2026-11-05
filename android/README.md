# CivicLens Edge Mobile Client (Android 10+ AOSP)

This module provides the on-device Edge AI client deployed on refurbished municipal smartphones (BOM: ~₹3,550 – ₹4,200 per vehicle).

### Architecture Highlights:
* **CameraX Sensor Pipeline (`CameraPatrolService.kt`)**: Runs 1 FPS frame analysis, with automatic exposure lock.
* **Screen Blackout Mode**: App runs as an Android Foreground Service with 0% screen brightness or blacked out display, cutting internal heat by 40%.
* **Thermal Governor**:
  * $< 40^\circ\text{C}$: Standard sampling (1 frame / 1.5s).
  * $40^\circ\text{C} - 45^\circ\text{C}$: Throttled mode (1 frame / 4.0s).
  * $> 46^\circ\text{C}$: Camera inference halts; enters 5-minute low power sleep.
* **Stationary Pause**: If GNSS speed is $< 3\text{ km/h}$ (e.g. at traffic signal), frame inference pauses to save compute and battery.
* **TFLite YOLOv8n INT8 (`YoloVisionDetector.kt`)**: 5 core municipal classes (`garbage_overflow`, `road_pothole`, `open_manhole`, `external_accident`, `illegal_banner`) with confidence thresholds $\ge 0.70 - 0.85$.
* **On-Device SLM Validator (`SmolLMContextValidator.kt`)**: Awakens only upon a positive vision detection to generate plain-English summaries.
* **Offline-First Outbox (`IncidentDatabase.kt` & `SyncWorker.kt`)**: Compresses frames to ~40 KB WebP; stores records in Room SQLite (`incident_outbox`). Upon receiving `HTTP 200 OK`, purges local media files from device flash memory.
* **Emergency IMU Trigger (`MotionSensorManager.kt`)**: Hardware accelerometer listener triggers immediate crash/rollover dispatch when deceleration $\ge 4.5g$.
* **Ignition-Linked Power (`PowerStateReceiver.kt`)**: Automatic wakeup when ACC line powers 5V buck converter; flushes queue and sleeps when vehicle engine cuts off.

