# CivicLens AI — Mobile Edge Implementation Procedure

This guide provides the complete, step-by-step engineering procedure to set up, build, test, and install the **CivicLens Edge Client** on vehicle-mounted Android devices (PRD Sections 2, 3, and 4).

---

## Phase 1: Hardware Procurement & Vehicle Wiring

### 1.1 Bill of Materials (BOM per Vehicle: ~₹3,550 – ₹4,200)
1. **Refurbished Android Device:** Snapdragon / MediaTek SoC, 3–4 GB RAM, Android 10+ (API 29+), $\ge 1080\text{p}$ optical sensor with autofocus, GNSS & 4G LTE (~₹2,800 – ₹3,200).
2. **DC-DC Step-Down Buck Converter:** 12V/24V to 5V 3A DC step-down module with right-angle USB-C (~₹250 – ₹350).
3. **Fuse Tap:** Mini/Standard Add-A-Circuit fuse tap with a 2A fast-blow fuse (~₹100 – ₹150).
4. **Mounting Bracket:** Mechanical screw-clamp suction mount designed for summer heat and high vibration (~₹250 – ₹350).
5. **Cabling:** 3-meter 20 AWG shielded USB-C cable (~₹150).

### 1.2 Electrical Wiring Diagram
```
[ Vehicle 12V/24V Fuse Panel ]
               │
               ├── ACC / Ignition Circuit ──> [2A Fast-Blow Fuse] ──> [Add-a-Circuit Fuse Tap]
               └── Ground (GND) ────────────> Chassis Bolt (Clean bare metal)
                                                     │
                                                     ▼
                                    [12V/24V to 5V 3A DC-DC Buck]
                                                     │ (3m Shielded USB-C)
                                                     ▼
                                       [Refurbished Android Device]
                                       • Front windshield mount
                                       • Camera angled at carriage-way
```

### 1.3 Ignition-Linked Auto Boot Setup
To ensure the phone boots automatically when the municipal vehicle engine starts:
1. Enable **Developer Options** and **USB Debugging** on the Android device.
2. Connect to PC and reboot into bootloader:
   ```bash
   adb reboot bootloader
   ```
3. Set auto-power on upon receiving USB DC power:
   ```bash
   fastboot oem off-mode-charge 0
   fastboot reboot
   ```
*(When ACC ignition powers on, the device automatically boots and triggers `PowerStateReceiver.kt` which launches `CameraPatrolService.kt`).*

---

## Phase 2: Android Studio Project Setup

### 2.1 Opening the Project
1. Launch **Android Studio** (Hedgehog 2023.1.1, Iguana, or newer).
2. Select **Open** and navigate to:
   ```
   c:\PROJECTS\GDG\CivilSense\android
   ```
3. Let Gradle sync project dependencies.

### 2.2 Verifying Key Dependencies (`app/build.gradle.kts`)
The project utilizes native Jetpack libraries:
* **CameraX (`1.3.1`):** `camera-core`, `camera-camera2`, `camera-lifecycle` for optical analysis.
* **TFLite (`2.14.0`):** `tensorflow-lite`, `tensorflow-lite-gpu`, `tensorflow-lite-support` for sub-110ms mobile NPU/GPU inference.
* **Room Database (`2.6.1`):** SQLite `incident_outbox` FIFO queue for offline resilience.
* **WorkManager (`2.9.0`):** Battery-conscious, network-gated background sync.
* **Play Services Location (`21.1.0`):** Fused location provider for GNSS speed and 6-decimal coordinates.

---

## Phase 3: Exporting & Placing the YOLOv8n TFLite Model

### 3.1 Exporting INT8 Quantized Model
To export the 5-class municipal vision model from Ultralytics into a quantized $\le 6\text{ MB}$ INT8 TFLite model:
```bash
# In Python terminal
pip install ultralytics tensorflow

python -c "
from ultralytics import YOLO
# Load fine-tuned YOLOv8n weights
model = YOLO('yolov8n.pt') 
# Export to INT8 quantized TFLite format
model.export(format='tflite', int8=True, imgsz=640)
"
```

### 3.2 Placing Model in Android Assets
1. In Android Studio, create the `assets` folder under `app/src/main/assets/` if not present.
2. Copy `yolov8n_int8.tflite` into `app/src/main/assets/yolov8n_int8.tflite`.
3. In `YoloVisionDetector.kt`, the model is loaded with GPU/NNAPI acceleration delegate.

### 3.3 Confidence Threshold Matrix (PRD Section 4.1)
* `garbage_overflow` $\ge 0.70$
* `road_pothole` $\ge 0.75$
* `open_manhole` $\ge 0.85$ *(High Priority Safety Hazard)*
* `external_accident` $\ge 0.75$
* `illegal_banner` $\ge 0.75$

---

## Phase 4: Backend Endpoint Configuration

### 4.1 Configuring the Ingestion URL
Open [SyncWorker.kt](file:///c:/PROJECTS/GDG/CivilSense/android/app/src/main/java/com/civiclens/edge/sync/SyncWorker.kt):
```kotlin
// Line 31 in SyncWorker.kt:
// Option A: If testing on Android Emulator
val backendUrl = "http://10.0.2.2:8000/api/v1/telemetry/incident"

// Option B: If testing on Physical Phone connected to your WiFi or Hotspot
// Find your laptop's IP using `ipconfig` (e.g., 192.168.1.45)
val backendUrl = "http://192.168.1.45:8000/api/v1/telemetry/incident"
```

---

## Phase 5: On-Device Thermal & Energy Governor

The client implements strict protections to withstand extreme temperatures (PRD Section 3.2):

1. **Screen Blackout Service:**
   * The camera pipeline executes as an Android **Foreground Service** (`CameraPatrolService.kt`).
   * The display brightness is set to 0% / screen turned off, cutting internal operating heat by **40%**.
2. **Thermal Throttling Governor:**
   * **$< 40^\circ\text{C}$:** Standard sampling (1 frame every 1.5 seconds).
   * **$40^\circ\text{C} - 45^\circ\text{C}$:** Throttled sampling (1 frame every 4.0 seconds).
   * **$> 46^\circ\text{C}$:** Halts camera inference immediately, triggers low-power telemetry alert, and enters 5-minute cooldown.
3. **Stationary Pause:**
   * If GNSS speed drops below **$3\text{ km/h}$** (e.g. at traffic signal), frame analysis is paused to avoid redundant duplicate processing and conserve battery.
4. **4.5g Emergency Crash Trigger:**
   * Accelerometer listener in `MotionSensorManager.kt` checks for rapid deceleration spikes ($\ge 4.5g$). When detected, it immediately bypasses standard queues and triggers emergency medical/police alert.

---

## Phase 6: Step-by-Step Testing & Verification Checklist

### Step 1: Run the Backend
Ensure the FastAPI backend is running on your machine:
```powershell
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Build & Launch on Device / Emulator
1. Connect your Android phone or start an Android Emulator with API 29+.
2. Click **Run 'app'** (`Shift + F10`) in Android Studio.
3. Grant **Camera** and **Location** permissions when prompted.

### Step 3: Verify the Live Telemetry HUD
On the phone screen, verify:
* **Camera Preview** is active.
* **Thermal Readout:** Displays `SoC Temp: 36.8°C (Normal Cadence 1.5s)`.
* **GNSS Speed:** Displays current vehicle speed.

### Step 4: Test Defect Detection & Offline Store-and-Forward
1. Point camera towards a test road image or defect on your computer screen.
2. When confidence $\ge$ threshold:
   * Vision model triggers positive detection.
   * On-device SLM produces plain-English context.
   * Frame is compressed to a **~42 KB WebP** image.
   * Record is saved to Room SQLite with `sync_status = PENDING`.
3. WorkManager initiates background upload to `POST /api/v1/telemetry/incident`.
4. When `HTTP 200 OK` is received:
   * **Device flash memory is purged** (WebP file deleted).
   * Room DB record is removed.
   * Outbox counter returns to 0.

### Step 5: Test Offline Resilience
1. Turn on **Airplane Mode** on the phone.
2. Trigger multiple detections.
3. Verify that all incidents queue up safely in Room DB outbox (`Outbox: X pending`).
4. Turn **Airplane Mode off** and tap **"Flush Outbox Queue"**.
5. Observe the batch streaming to the server and local memory clearing automatically!

---

## Phase 7: Deployment to Municipal Fleet

| Step | Action |
| --- | --- |
| **Mounting** | Fix mechanical screw-clamp mount at bottom center of vehicle windshield below wiper swipe. |
| **Angle Alignment** | Adjust pitch so 55% of the frame is road asphalt and 45% is horizon/sidewalk. |
| **Wiring Tuck** | Tuck the 3m USB-C cable behind rubber windshield weather-stripping to cabin fuse panel. |
| **Device ID** | Assign each vehicle its unique device ID (e.g. `DEV-001` for Sweeper #04, `DEV-002` for Bus #12). |

