// Package profile contains the fixed target PC profile for this WinForge build.
// The values are intentionally explicit so the dashboard and CLI stay focused
// on the Windows 11 machine this project is being completed for.
package profile

import "fmt"

// OperatingSystem describes the Windows target.
type OperatingSystem struct {
	Edition           string `json:"edition"`
	Version           string `json:"version"`
	InstalledOn       string `json:"installedOn"`
	EvaluationExpires string `json:"evaluationExpires"`
	Build             string `json:"build"`
	Experience        string `json:"experience"`
}

// Hardware describes the target device hardware.
type Hardware struct {
	Processor      string   `json:"processor"`
	RAMGB          float64  `json:"ramGb"`
	UsableRAMGB    float64  `json:"usableRamGb"`
	Graphics       []string `json:"graphics"`
	StorageUsedGB  int      `json:"storageUsedGb"`
	StorageTotalGB int      `json:"storageTotalGb"`
}

// Profile is the full target profile exposed by the CLI and local API.
type Profile struct {
	DeviceName         string          `json:"deviceName"`
	OperatingSystem    OperatingSystem `json:"operatingSystem"`
	Hardware           Hardware        `json:"hardware"`
	OptimizationFocus  []string        `json:"optimizationFocus"`
	RecommendedPresets []string        `json:"recommendedPresets"`
	AvoidPresets       []string        `json:"avoidPresets"`
}

// Target is the user's Windows 11 PC that this build is optimized for.
var Target = Profile{
	DeviceName: "DESKTOP-HI525Q3",
	OperatingSystem: OperatingSystem{
		Edition:           "Windows 11 Pro Insider Preview",
		Version:           "Dev",
		InstalledOn:       "2026-08-31",
		EvaluationExpires: "2027-11-01 05:13",
		Build:             "29648.1000",
		Experience:        "Windows Feature Experience Pack 1000.26100.408.0",
	},
	Hardware: Hardware{
		Processor:      "Intel(R) Core(TM) i7-10510U CPU @ 1.80GHz (2.30 GHz)",
		RAMGB:          20.0,
		UsableRAMGB:    19.8,
		Graphics:       []string{"NVIDIA GeForce MX330 (2 GB)", "Intel(R) UHD Graphics (128 MB)"},
		StorageUsedGB:  135,
		StorageTotalGB: 466,
	},
	OptimizationFocus: []string{
		"safe Windows 11 Dev Channel privacy and telemetry controls",
		"balanced performance for a 10th Gen low-voltage Intel i7",
		"protect NVIDIA MX330, Intel graphics, Store, Defender, and update components",
		"moderate startup cleanup and background-app reduction before aggressive service disabling",
		"maintain at least 20% free disk before ISO, component cleanup, or Windows Update work",
	},
	RecommendedPresets: []string{"standard", "privacy"},
	AvoidPresets:       []string{"expert"},
}

// StorageFreeGB returns available storage from the provided capacity snapshot.
func StorageFreeGB(p Profile) int {
	return p.Hardware.StorageTotalGB - p.Hardware.StorageUsedGB
}

// StorageUsagePercent returns rounded disk usage percentage.
func StorageUsagePercent(p Profile) int {
	if p.Hardware.StorageTotalGB <= 0 {
		return 0
	}
	return int(float64(p.Hardware.StorageUsedGB)/float64(p.Hardware.StorageTotalGB)*100 + 0.5)
}

// Summary returns a compact one-line description suitable for CLI output.
func Summary(p Profile) string {
	return fmt.Sprintf("%s build %s on %s, %.0f GB RAM, %s",
		p.OperatingSystem.Edition,
		p.OperatingSystem.Build,
		p.Hardware.Processor,
		p.Hardware.RAMGB,
		joinGraphics(p.Hardware.Graphics),
	)
}

func joinGraphics(items []string) string {
	if len(items) == 0 {
		return "no graphics adapter recorded"
	}
	out := items[0]
	for _, item := range items[1:] {
		out += " + " + item
	}
	return out
}
