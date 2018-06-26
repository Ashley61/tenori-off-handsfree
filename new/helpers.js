/***********************************
 * Makes synth or drum noises
 ***********************************/
class NoiseyMakey {
  constructor() {
    this.initTone();  
    this.synthSounds = ['B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 
               'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3', 
               'B2', 'A2', 'G2', 'F2'];
    
    // From https://codepen.io/teropa/pen/JLjXGK. Thanks teropa!! <3
    let sampleBaseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699';
    this.drumSounds = [
      new Tone.Player(`${sampleBaseUrl}/808-kick-vm.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/flares-snare-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/808-hihat-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/808-hihat-open-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/slamdam-tom-low-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/slamdam-tom-mid-vm.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/slamdam-tom-high-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/909-clap-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/909-rim-vh.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/808-kick-vl.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/flares-snare-vl.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/808-hihat-vl.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/808-hihat-open-vl.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/slamdam-tom-low-vl.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/slamdam-tom-mid-vl.mp3`).toMaster(),
      new Tone.Player(`${sampleBaseUrl}/slamdam-tom-high-vl.mp3`).toMaster(),
    ];
  }
  
  initTone() {
    // Set up tone
    this.synth = new Tone.PolySynth(16, Tone.Synth).toMaster();
    
    const gain  = new Tone.Gain(0.5);
    this.synth.connect(gain);
    gain.toMaster();
  }
  
  getSound() {
    return this.isSynth ? 1 : 2;
  }
  
  playSynth(which) {
    synth.triggerAttackRelease(this.synthSounds[which], '16n');
  }
  
  clearDrum(which) {
    this.drumSounds[which].stop();
  }
  playDrum(which) {
    this.drumSounds[which].start(Tone.now(), 0);
  }
  play() {
    Tone.context.resume();
    Tone.Transport.start();
  }
  pause() {
    Tone.Transport.pause();
  }
}

/***********************************
 * Board of dots
 ***********************************/
class Board {
  constructor() {
    this.dots = this.init();
    this.ripples = [];
    this.isMouseDown = false;
    this.isPlaying = false;
    this.isSynth = false;
  }
  
  init() {
    this.dots = [];
    for (let i = 0; i < 16; i++) {
      this.dots.push([]);
      for (let j = 0; j < 16; j++) {
        this.dots[i][j] = {};
      }
    }
  }
  
  pause() {
    this.isPlaying = false;
  }
  play() {
    this.isPlaying = true;
  }
}