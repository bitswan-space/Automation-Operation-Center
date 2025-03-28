package profilemanager

import (
	"sync"
	"time"
)

const (
	profileTimeout = 1 * time.Hour
)

// Profile represents a profile with its properties
type Profile struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	LastAlive     time.Time `json:"last_alive"`
}

// ProfileManager handles the management of organization profiles
type ProfileManager struct {
	profiles map[string]map[string]*Profile // map[orgID]map[profileID]*Profile
	mu       sync.RWMutex
}

var (
	instance *ProfileManager
	once     sync.Once
)

// GetInstance returns the singleton instance of ProfileManager
func GetInstance() *ProfileManager {
	once.Do(func() {
		instance = &ProfileManager{
			profiles: make(map[string]map[string]*Profile),
		}
	})
	return instance
}

// UpdateProfiles updates the profiles for an organization
func (pm *ProfileManager) UpdateProfiles(orgID string, profiles []Profile) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	// Create or get organization profiles map
	orgProfiles, exists := pm.profiles[orgID]
	if !exists {
		orgProfiles = make(map[string]*Profile)
		pm.profiles[orgID] = orgProfiles
	}

	// Create a map of existing profiles for quick lookup
	existingProfiles := make(map[string]bool)
	for _, profile := range orgProfiles {
		existingProfiles[profile.ID] = true
	}

	// Create a map of new profiles for quick lookup
	newProfiles := make(map[string]bool)
	for _, profile := range profiles {
		newProfiles[profile.ID] = true
	}

	// Add new profiles that don't exist yet
	for _, profile := range profiles {
		if _, exists := orgProfiles[profile.ID]; !exists {
			profile.LastAlive = time.Now()
			orgProfiles[profile.ID] = &profile
		}
	}

	// Remove profiles that are not in the new list
	for profileID := range existingProfiles {
		if _, exists := newProfiles[profileID]; !exists {
			delete(orgProfiles, profileID)
		}
	}
}

// UpdateProfileLastAlive updates the last alive timestamp for a specific profile
func (pm *ProfileManager) UpdateProfileLastAlive(orgID, profileID string) error {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	orgProfiles, exists := pm.profiles[orgID]
	if !exists {
		return nil
	}

	if profile, exists := orgProfiles[profileID]; exists {
		profile.LastAlive = time.Now()
		return nil
	}

	return nil
}

// isProfileAlive checks if a profile is active based on its last alive timestamp
func (pm *ProfileManager) isProfileAlive(profile *Profile) bool {
	return time.Since(profile.LastAlive) < profileTimeout
}

// GetActiveProfiles returns all active profiles for an organization
func (pm *ProfileManager) GetActiveProfiles(orgID string) []*Profile {
	pm.mu.RLock()
	defer pm.mu.RUnlock()

	orgProfiles, exists := pm.profiles[orgID]
	if !exists {
		return nil
	}

	var activeProfiles []*Profile
	for _, profile := range orgProfiles {
		if pm.isProfileAlive(profile) {
			activeProfiles = append(activeProfiles, profile)
		}
	}

	return activeProfiles
} 