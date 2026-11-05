package com.civiclens.edge

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.room.Room
import com.civiclens.edge.db.IncidentDatabase

class CivicLensApp : Application() {

    lateinit var database: IncidentDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = Room.databaseBuilder(
            applicationContext,
            IncidentDatabase::class.java,
            "incident_outbox.db"
        ).fallbackToDestructiveMigration().build()

        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_PATROL,
                "CivicLens Vehicle Patrol Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors road condition and civic defects autonomously"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_PATROL = "civiclens_patrol_channel"
        lateinit var instance: CivicLensApp
            private set
    }
}

