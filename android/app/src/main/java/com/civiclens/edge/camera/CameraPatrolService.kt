package com.civiclens.edge.camera

import android.app.Notification
import android.app.PendingIntent
import android.content.Intent
import android.graphics.Bitmap
import android.os.BatteryManager
import android.os.IBinder
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import com.civiclens.edge.CivicLensApp
import com.civiclens.edge.ai.YoloVisionDetector
import com.civiclens.edge.ai.SmolLMContextValidator
import com.civiclens.edge.db.IncidentEntity
import com.civiclens.edge.sync.SyncWorker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class CameraPatrolService : LifecycleService() {

    private lateinit var visionDetector: YoloVisionDetector
    private lateinit var slmValidator: SmolLMContextValidator
    private var lastInferenceTime = 0L
    private var currentGpsSpeedKmh = 18.0f // updated from LocationManager
    private var currentLat = 17.7225
    private var currentLon = 83.3045

    override fun onCreate() {
        super.onCreate()
        visionDetector = YoloVisionDetector(applicationContext)
        slmValidator = SmolLMContextValidator(applicationContext)
        startForeground(1001, buildNotification())
        initCamera()
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CivicLensApp.CHANNEL_PATROL)
            .setContentTitle("CivicLens Edge Patrol Active")
            .setContentText("Autonomous road condition inspection running")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun initCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build()
            
            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(android.util.Size(1280, 720))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(this)) { imageProxy ->
                processFrame(imageProxy)
            }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun processFrame(imageProxy: ImageProxy) {
        val now = System.currentTimeMillis()

        // 1. Stationary Detection Check (PRD 3.2: < 3 km/h pauses inference)
        if (currentGpsSpeedKmh < 3.0f) {
            imageProxy.close()
            return
        }

        // 2. Thermal Throttling Governor (PRD 3.2)
        val tempC = getBatteryTemperature()
        val cadenceMs = when {
            tempC < 40.0f -> 1500L // 1.5 seconds standard
            tempC <= 45.0f -> 4000L // 4.0 seconds throttled
            else -> {
                // > 46C Halt camera inference
                imageProxy.close()
                return
            }
        }

        if (now - lastInferenceTime < cadenceMs) {
            imageProxy.close()
            return
        }
        lastInferenceTime = now

        // 3. Vision Detection Pipeline (TFLite YOLOv8n INT8)
        lifecycleScope.launch(Dispatchers.Default) {
            val detection = visionDetector.detect(imageProxy)
            imageProxy.close()

            if (detection != null && detection.confidence >= detection.threshold) {
                // 4. On-Device SLM Validator (SmolLM-135M / MobileLLM INT4)
                val summary = slmValidator.generateSummary(detection.defectType, detection.confidence)

                // 5. Encode frame to ~40 KB WebP
                val imageFile = saveFrameAsWebP(detection.bitmap)

                // 6. Record to SQLite / Room DB (Status: PENDING)
                val incident = IncidentEntity(
                    incidentId = UUID.randomUUID().toString(),
                    timestamp = now,
                    latitude = currentLat,
                    longitude = currentLon,
                    defectType = detection.defectType,
                    confidence = detection.confidence,
                    slmSummary = summary,
                    imagePath = imageFile.absolutePath,
                    syncStatus = "PENDING"
                )

                CivicLensApp.instance.database.incidentDao().insert(incident)

                // 7. Trigger Android WorkManager Sync
                SyncWorker.enqueueSync(applicationContext)
            }
        }
    }

    private fun getBatteryTemperature(): Float {
        val intent = registerReceiver(null, android.content.IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val temp = intent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 350) ?: 350
        return temp / 10.0f
    }

    private fun saveFrameAsWebP(bitmap: Bitmap): File {
        val storageDir = File(filesDir, "evidence_frames").apply { mkdirs() }
        val file = File(storageDir, "frame_${System.currentTimeMillis()}.webp")
        FileOutputStream(file).use { out ->
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
                bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, 75, out)
            } else {
                bitmap.compress(Bitmap.CompressFormat.WEBP, 75, out)
            }
        }
        return file
    }

    override fun onDestroy() {
        super.onDestroy()
        visionDetector.close()
        slmValidator.close()
    }
}

