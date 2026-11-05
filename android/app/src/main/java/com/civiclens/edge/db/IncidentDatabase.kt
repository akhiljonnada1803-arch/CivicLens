package com.civiclens.edge.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "incident_outbox")
data class IncidentEntity(
    @PrimaryKey
    @ColumnInfo(name = "incident_id")
    val incidentId: String,

    @ColumnInfo(name = "timestamp")
    val timestamp: Long,

    @ColumnInfo(name = "latitude")
    val latitude: Double,

    @ColumnInfo(name = "longitude")
    val longitude: Double,

    @ColumnInfo(name = "defect_type")
    val defectType: String, // GARBAGE, POTHOLE, MANHOLE, ACCIDENT, OVERSPEED

    @ColumnInfo(name = "confidence")
    val confidence: Float,

    @ColumnInfo(name = "slm_summary")
    val slmSummary: String?,

    @ColumnInfo(name = "image_path")
    val imagePath: String,

    @ColumnInfo(name = "sync_status")
    val syncStatus: String = "PENDING" // PENDING, SYNCED, FAILED
)

@Dao
interface IncidentDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(incident: IncidentEntity)

    @Query("SELECT * FROM incident_outbox WHERE sync_status = 'PENDING' ORDER BY timestamp ASC")
    suspend fun getPendingIncidents(): List<IncidentEntity>

    @Query("UPDATE incident_outbox SET sync_status = :status WHERE incident_id = :id")
    suspend fun updateSyncStatus(id: String, status: String)

    @Delete
    suspend fun delete(incident: IncidentEntity)

    @Query("DELETE FROM incident_outbox WHERE incident_id = :id")
    suspend fun deleteById(id: String)
}

@Database(entities = [IncidentEntity::class], version = 1, exportSchema = false)
abstract class IncidentDatabase : RoomDatabase() {
    abstract fun incidentDao(): IncidentDao
}

