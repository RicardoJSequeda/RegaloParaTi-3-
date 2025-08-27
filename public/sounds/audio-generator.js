// Generador de audio sintético para efectos de sonido
// Este archivo genera diferentes tipos de sonidos usando Web Audio API

class AudioGenerator {
  constructor() {
    this.audioContext = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API no soportada');
    }
  }

  // Generar campanilla mágica
  generateMagicChime() {
    if (!this.audioContext) return;
    
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    const duration = 0.3;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, 0.3);
      }, index * 100);
    });
  }

  // Generar campanilla romántica
  generateRomanticChime() {
    if (!this.audioContext) return;
    
    const frequencies = [440, 554.37, 659.25, 880]; // A, C#, E, A
    const duration = 0.4;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, 0.25);
      }, index * 150);
    });
  }

  // Generar sonido de abrir regalo
  generateGiftOpen() {
    if (!this.audioContext) return;
    
    // Sonido de papel arrugándose
    const noise = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() - 0.5) * 2 * Math.exp(-i / (buffer.length * 0.1));
    }
    
    noise.buffer = buffer;
    noise.connect(this.audioContext.destination);
    noise.start();
  }

  // Generar nota musical
  generateMusicNote() {
    if (!this.audioContext) return;
    
    const frequencies = [523.25, 587.33, 659.25]; // C, D, E
    const duration = 0.5;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, 0.4);
      }, index * 200);
    });
  }

  // Generar campanas de boda
  generateWeddingBells() {
    if (!this.audioContext) return;
    
    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C, E, G, C, E
    const duration = 0.6;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, 0.35);
      }, index * 300);
    });
  }

  // Reproducir un tono específico
  playTone(frequency, duration, volume = 0.5) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.AudioGenerator = AudioGenerator;
}

// Función para generar archivos de audio
function generateAudioFiles() {
  const generator = new AudioGenerator();
  
  // Generar diferentes tipos de sonidos
  const sounds = {
    'magic-chime': () => generator.generateMagicChime(),
    'romantic-chime': () => generator.generateRomanticChime(),
    'gift-open': () => generator.generateGiftOpen(),
    'music-note': () => generator.generateMusicNote(),
    'wedding-bells': () => generator.generateWeddingBells()
  };
  
  return sounds;
}

// Función para reproducir sonido por nombre
function playSound(soundName) {
  const generator = new AudioGenerator();
  const sounds = generateAudioFiles();
  
  if (sounds[soundName]) {
    sounds[soundName]();
  } else {
    console.log(`Sonido ${soundName} no encontrado`);
  }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioGenerator, generateAudioFiles, playSound };
} else if (typeof window !== 'undefined') {
  window.playSound = playSound;
}
