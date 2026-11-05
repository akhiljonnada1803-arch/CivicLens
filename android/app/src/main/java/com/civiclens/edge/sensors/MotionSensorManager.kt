package com.civiclens.edge.sensors

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.civiclens.edge.camera.CameraPatrolService
import com.civiclens.edge.sync.SyncWorker
import kotlin.math.sqrt

class PowerStateReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_POWER_CONNECTED, Intent.ACTION_BOOT_COMPLETED -> {
                // ACC ON (Vehicle Running): Start detection service
                val serviceIntent = Intent(context, CameraPatrolService::class.java)
                context.startForegroundService(serviceIntent)
            }
            Intent.ACTION_POWER_DISCONNECTED -> {
                // ACC OFF (Engine Stopped): Flush unsent queues and put device to sleep (PRD 3.2)
                SyncWorker.enqueueSync(context)
                val serviceIntent = Intent(context, CameraPatrolService::class.java)
                context.stopService(serviceIntent)
            }
        }
    }
}

class MotionSensorManager(
    private val context: Context,
    private val onCrashSpikeDetected: (gForce: Float) -> Unit
) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

    fun start() {
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_FASTEST)
        }
    }

    fun stop() {
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val ax = event.values[0]
            val ay = event.values[1]
            val az = event.values[2]

            // Calculate total acceleration magnitude in standard g (9.81 m/s^2)
            val totalAccel = sqrt(ax * ax + ay * ay + az * az)
            val gForce = totalAccel / SensorManager.GRAVITY_EARTH

            // PRD Section 4 & 5.3: Accel >= 4.5g -> Emergency Crash Alert (<5 seconds)
            if (gForce >= 4.5f) {
                onCrashSpikeDetected(gForce)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}

