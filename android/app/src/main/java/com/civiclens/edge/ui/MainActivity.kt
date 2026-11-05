package com.civiclens.edge.ui

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.civiclens.edge.CivicLensApp
import com.civiclens.edge.R
import com.civiclens.edge.camera.CameraPatrolService
import com.civiclens.edge.sync.SyncWorker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var cameraPreview: PreviewView
    private lateinit var tvThermalStatus: TextView
    private lateinit var tvOutboxCount: TextView
    private lateinit var btnTogglePatrol: Button
    private lateinit var btnFlushOutbox: Button

    private var isPatrolRunning = false

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] == true
        val locationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        if (cameraGranted && locationGranted) {
            startCameraPreview()
        } else {
            Toast.makeText(this, "Camera and Location permissions are required for Edge AI patrol.", Toast.LENGTH_LONG).show()
        }
    }

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val tempRaw = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 350)
            val tempC = tempRaw / 10.0f
            val state = when {
                tempC < 40.0f -> "Normal (1.5s sampling)"
                tempC <= 45.0f -> "Throttled (4.0s sampling)"
                else -> "HALTED (>46°C protection)"
            }
            tvThermalStatus.text = "SoC Temp: ${String.format("%.1f", tempC)}°C ($state)"
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        cameraPreview = findViewById(R.id.cameraPreview)
        tvThermalStatus = findViewById(R.id.tvThermalStatus)
        tvOutboxCount = findViewById(R.id.tvOutboxCount)
        btnTogglePatrol = findViewById(R.id.btnTogglePatrol)
        btnFlushOutbox = findViewById(R.id.btnFlushOutbox)

        checkAndRequestPermissions()
        setupListeners()
        updateOutboxCount()
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isEmpty()) {
            startCameraPreview()
        } else {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }

    private fun startCameraPreview() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(cameraPreview.surfaceProvider)
            }
            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun setupListeners() {
        btnTogglePatrol.setOnClickListener {
            val serviceIntent = Intent(this, CameraPatrolService::class.java)
            if (!isPatrolRunning) {
                ContextCompat.startForegroundService(this, serviceIntent)
                btnTogglePatrol.text = "Stop Edge Patrol Service"
                btnTogglePatrol.setBackgroundColor(0xFFDC2626.toInt()) // Red
                isPatrolRunning = true
                Toast.makeText(this, "CivicLens Edge Patrol Service Started", Toast.LENGTH_SHORT).show()
            } else {
                stopService(serviceIntent)
                btnTogglePatrol.text = "Start Edge Patrol Service"
                btnTogglePatrol.setBackgroundColor(0xFF2563EB.toInt()) // Blue
                isPatrolRunning = false
                Toast.makeText(this, "Edge Patrol Service Stopped", Toast.LENGTH_SHORT).show()
            }
        }

        btnFlushOutbox.setOnClickListener {
            SyncWorker.enqueueSync(this)
            Toast.makeText(this, "Triggering WorkManager Outbox Sync...", Toast.LENGTH_SHORT).show()
            updateOutboxCount()
        }
    }

    private fun updateOutboxCount() {
        lifecycleScope.launch(Dispatchers.IO) {
            val count = CivicLensApp.instance.database.incidentDao().getPendingIncidents().size
            withContext(Dispatchers.Main) {
                tvOutboxCount.text = "Room DB Outbox: $count pending store-and-forward"
            }
        }
    }

    override fun onResume() {
        super.onResume()
        registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        updateOutboxCount()
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(batteryReceiver)
    }
}

