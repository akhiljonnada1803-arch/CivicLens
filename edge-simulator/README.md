# CivicLens Edge Device Simulator

Simulates an on-vehicle Android 10+ edge hardware mount (as specified in **PRD Sections 3 & 4**).

### Features Simulated:
1. **CameraX Frame Analysis**: Standard 1.5s cadence, thermal-throttled to 4.0s when SoC $> 40^\circ\text{C}$, and halted at $> 46^\circ\text{C}$.
2. **Stationary Pause**: Skips inference frames if vehicle speed is $< 3\text{ km/h}$.
3. **Edge Vision & SLM**: Simulates INT8 YOLOv8n detections with on-device SmolLM / MobileLLM plain-English context summaries.
4. **Offline Store-and-Forward**: Uses local SQLite outbox queue (`edge_outbox.db`) if network drops; automatically flushes pending incidents upon cellular reconnection.
5. **Memory Protection**: Compresses frames to ~40 KB WebP and purges files from memory upon receiving HTTP 200 OK.

### Running the Simulator:

```bash
# 1. Standard Live Patrol (Streams to FastAPI backend):
python edge-simulator/simulator.py

# 2. Simulate Offline Drive (Stores to Room DB outbox):
python edge-simulator/simulator.py --offline

# 3. Simulate Network Reconnection (Flushes Outbox):
python edge-simulator/simulator.py --flush
```

