// Sound Effects Module - Replaces the old sounds.js
// This file provides audio feedback for user interactions

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
    }

    init() {
        // Load saved settings
        const savedEnabled = localStorage.getItem('soundEnabled');
        const savedVolume = localStorage.getItem('soundVolume');
        
        if (savedEnabled !== null) {
            this.enabled = savedEnabled === 'true';
        }
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    setVolume(volume) {
        this.volume = volume;
        localStorage.setItem('soundVolume', volume);
    }

    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled) return;
        
        try {
            const ctx = this.getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    playClick() {
        this.playTone(800, 0.05);
    }

    playSuccess() {
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.15), 200);
    }

    playError() {
        this.playTone(200, 0.2, 'square');
    }

    playNavigation() {
        this.playTone(440, 0.05);
    }

    playHover() {
        this.playTone(600, 0.03);
    }

    playDelete() {
        this.playTone(400, 0.1);
        setTimeout(() => this.playTone(300, 0.15), 100);
    }

    playEdit() {
        this.playTone(500, 0.08);
    }

    playNotification() {
        this.playTone(600, 0.1);
        setTimeout(() => this.playTone(800, 0.1), 150);
    }
}

const soundManager = new SoundManager();
soundManager.init();

// Global functions for backward compatibility
function playClickSound() {
    soundManager.playClick();
}

function playSuccessSound() {
    soundManager.playSuccess();
}

function playErrorSound() {
    soundManager.playError();
}

function playNavigationSound() {
    soundManager.playNavigation();
}

function playHoverSound() {
    soundManager.playHover();
}

function playDeleteSound() {
    soundManager.playDelete();
}

function playEditSound() {
    soundManager.playEdit();
}

function playNotificationSound() {
    soundManager.playNotification();
}

function toggleSound(enabled) {
    soundManager.setEnabled(enabled);
}

function updateVolume(value) {
    soundManager.setVolume(value);
}