/***********************************
 * Makes synth or drum noises
 ***********************************/
class NoiseyMakey {
  constructor() {
    this.synth = this._makeASynth()
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
  
  play() {
    Tone.context.resume();
    Tone.Transport.start();
  }
  
  pause() {
    Tone.Transport.pause();
  }
  
  // Whether we are currently on to play a drum or a synth
  getSound() {
    return this.isSynth ? 1 : 2;
  }
  
  // Play specific sounds.
  playSynth(which) {
    this.synth.triggerAttackRelease(this.synthSounds[which], '16n');
  }
  
  playDrum(which) {
    this.drumSounds[which].start(Tone.now(), 0);
  }
  
  // Drums need to be cleared since they're just a looping mp3.
  clearDrum(which) {
    this.drumSounds[which].stop();
  }
  
  _makeASynth() {
    // Set up tone.
    const synth = new Tone.PolySynth(16, Tone.Synth).toMaster();
    synth.connect(new Tone.Gain(0.5).toMaster());
    return synth;
  }
}

/***********************************
 * Board of dots
 ***********************************/]
class Board {
  constructor() {
    this.data = [];
    this.ripples = [];
    this.ui = {}; // gets populated by this.reset();
    
    this.reset();
    
    this.isPlaying = false;
  }
  
  reset() {
    this.data = [];
    this.ui.container = document.getElementById('container');
    this.ui.container.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
      this.data.push([]);
      const rowEl = document.createElement('div');
      rowEl.classList.add('row');
      this.ui.container.appendChild(rowEl);
      
      for (let j = 0; j < 16; j++) {
        this.data[i][j] = {};
        const button = document.createElement('button');
        button.classList.add('pixel');
        button.dataset.row = i;
        button.dataset.col = j;
        rowEl.appendChild(button);
      }
    }
    
    this.ui.dotRows = document.querySelectorAll('.container > .row');
  }
  
  pause() {
    this.isPlaying = false;
  }
  
  play() {
    this.isPlaying = true;
  }
  
  // Toggles a particular dot from on to off.
  toggleCell(i,j, sound) {
    const dot = this.data[i][j];
    if (dot.on) {
      dot.on = 0;
    } else {
      dot.on = sound;
    }
    
    this.draw();
  }
  
  // Paints the current state of the world.
  draw() {
    this._updateRipples();
    
    for (let i = 0; i < 16; i++) {
      const pixels = this.ui.dotRows[i].querySelectorAll('.pixel');
      
      for (let j = 0; j < 16; j++) {
        const cell = board.data[i][j];

        // If the dot is on, set it on with the right sound.
        if (this._paintSoundCell(board.data[i][j], pixels[j])) {
          continue;
        }
        
        this._paintRippleCell(pixels[j], i, j);
      }
    }
  }
  
  _updateRipples() {
    for (let i = 0; i < this.ripples.length; i++) {
      // If the ripples it too big, nuke it.
      if (this.ripples[i].distance > 6) {
          this.ripples.splice(i, 1);
      } else {
        this.ripples[i].distance += 1;
      }
    }
  }
  
   // Displays the right sound on a UI cell, if it's on.
  _paintSoundCell(dataCell, uiCell) {
    const didIt = false;
    if (dataCell.on) {
      uiCell.classList.add('on');
      
      // Display the correct sound.
      uiCell.classList.remove('drums');
      uiCell.classList.remove('synth');
      uiCell.classList.add(dataCell.on === 1 ? 'synth' : 'drums');
      didIt = true;
    } else {
      uiCell.classList.remove('on');
    }
    return didIt;
  }
  
  _paintRippleCell(uiCell, i, j) {
    // Clear the old ripple, if it exists.
    uiCell.classList.remove('ripple');

    // Is this pixel inside a ripple?
    for(let r = 0; r < this.ripples.length; r++) {
      const ripple = this.ripples[r];
      
      // Math. We basically want to draw a donut around the ripple center.
      // A distance is sqrt(x1-x2)^2 + (
      let distanceFromRippleCenter = Math.sqrt((i-ripple.x)*(i-ripple.x) + (j-ripple.y)*(j-ripple.y));

      if(distanceFromRippleCenter > ripple.distance - 0.7 && 
         distanceFromRippleCenter < ripple.distance + 0.7 &&
         distanceFromRippleCenter < 3.5) {
        pixels[j].classList.add('ripple');
        pixels[j].classList.add(ripple.synth ? 'synth' : 'drums');
      }
    }
  }
}