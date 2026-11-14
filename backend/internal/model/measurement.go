package model

// SyncMeasurementItem represents a single measurement sent from the mobile app during sync.
type SyncMeasurementItem struct {
	Value   float64 `json:"value"`
	Date    string  `json:"date"`
	Context string  `json:"context"`
	Note    *string `json:"note"`
}

// SyncMeasurementsResponse is returned after a batch sync operation.
type SyncMeasurementsResponse struct {
	Message                   string      `json:"message"`
	TotalMeasurementsOnServer int         `json:"total_measurements_on_server"`
	InsertedCount             int         `json:"inserted_count"`
	UnlockedAchievements      interface{} `json:"unlocked_achievements,omitempty"`
}
