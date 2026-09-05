package profile

import (
	"strings"
	"testing"
)

func TestTargetProfileCapturesWindows11DevMachine(t *testing.T) {
	if Target.DeviceName != "DESKTOP-HI525Q3" {
		t.Fatalf("device = %q", Target.DeviceName)
	}
	if Target.OperatingSystem.Edition != "Windows 11 Pro Insider Preview" {
		t.Fatalf("edition = %q", Target.OperatingSystem.Edition)
	}
	if Target.OperatingSystem.Version != "Dev" || Target.OperatingSystem.Build != "29648.1000" {
		t.Fatalf("unexpected Windows version/build: %s %s", Target.OperatingSystem.Version, Target.OperatingSystem.Build)
	}
	if Target.Hardware.RAMGB != 20 || Target.Hardware.UsableRAMGB != 19.8 {
		t.Fatalf("unexpected RAM: %.1f/%.1f", Target.Hardware.RAMGB, Target.Hardware.UsableRAMGB)
	}
	if len(Target.Hardware.Graphics) != 2 || !strings.Contains(Target.Hardware.Graphics[0], "MX330") {
		t.Fatalf("unexpected graphics list: %#v", Target.Hardware.Graphics)
	}
}

func TestStorageCalculations(t *testing.T) {
	if got := StorageFreeGB(Target); got != 331 {
		t.Fatalf("free GB = %d", got)
	}
	if got := StorageUsagePercent(Target); got != 29 {
		t.Fatalf("usage percent = %d", got)
	}
	zero := Target
	zero.Hardware.StorageTotalGB = 0
	if got := StorageUsagePercent(zero); got != 0 {
		t.Fatalf("zero total usage = %d", got)
	}
}

func TestSummaryIncludesCriticalIdentity(t *testing.T) {
	s := Summary(Target)
	for _, want := range []string{"Windows 11 Pro Insider Preview", "29648.1000", "i7-10510U", "20 GB RAM", "NVIDIA GeForce MX330"} {
		if !strings.Contains(s, want) {
			t.Fatalf("summary %q missing %q", s, want)
		}
	}
}
