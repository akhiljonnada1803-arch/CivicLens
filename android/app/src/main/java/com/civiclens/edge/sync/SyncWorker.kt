package com.civiclens.edge.sync

import android.content.Context
import androidx.work.*
import com.civiclens.edge.CivicLensApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.util.concurrent.TimeUnit

class SyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val dao = CivicLensApp.instance.database.incidentDao()
        val pendingList = dao.getPendingIncidents()

        if (pendingList.isEmpty()) {
            return@withContext Result.success()
        }

        var allSuccess = true
        val backendUrl = "http://10.0.2.2:8000/api/v1/telemetry/incident" // standard android emulator gateway

        for (incident in pendingList) {
            val file = File(incident.imagePath)
            if (!file.exists()) {
                dao.deleteById(incident.incidentId)
                continue
            }

            val requestBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("device_id", "DEV-001")
                .addFormDataPart("lat", incident.latitude.toString())
                .addFormDataPart("lon", incident.longitude.toString())
                .addFormDataPart("defect_type", incident.defectType)
                .addFormDataPart("confidence", incident.confidence.toString())
                .addFormDataPart("slm_summary", incident.slmSummary ?: "")
                .addFormDataPart(
                    "evidence_image",
                    file.name,
                    file.asRequestBody("image/webp".toMediaTypeOrNull())
                )
                .build()

            val request = Request.Builder()
                .url(backendUrl)
                .post(requestBody)
                .build()

            try {
                val response = httpClient.newCall(request).execute()
                if (response.isSuccessful) {
                    // HTTP 200 OK: Purge media from device flash memory (PRD 4.2)
                    if (file.exists()) {
                        file.delete()
                    }
                    dao.deleteById(incident.incidentId)
                } else {
                    dao.updateSyncStatus(incident.incidentId, "FAILED")
                    allSuccess = false
                }
                response.close()
            } catch (e: Exception) {
                dao.updateSyncStatus(incident.incidentId, "FAILED")
                allSuccess = false
            }
        }

        if (allSuccess) Result.success() else Result.retry()
    }

    companion object {
        fun enqueueSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                "civiclens_outbox_sync",
                ExistingWorkPolicy.APPEND_OR_REPLACE,
                request
            )
        }
    }
}

