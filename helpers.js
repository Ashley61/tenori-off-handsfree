/***********************************
 * Makes synth or drum noises
 ***********************************/
class NoiseyMakey {
  constructor() {
    this.synth = this._makeASynth();
    this.isSynth = true;
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
  resetDrums() {
    for (let i = 0; i < 16; i++) {
      this.drumSounds[i].stop();
    }
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
 ***********************************/
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
    
    this.ui.rows = document.querySelectorAll('.container > .row');
    this.draw();
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
      const pixels = this.ui.rows[i].querySelectorAll('.pixel');
      
      for (let j = 0; j < 16; j++) {
        // Maybe it's a sound?
        if (this._paintSoundCell(this.data[i][j], pixels[j])) {
          continue;
        }
        // Maybe it's part of a ripple?
        this._paintRippleCell(pixels[j], i, j);
      }
    }
  }
  
  animate(currentColumn, noiseyMakey) {
    for (let i = 0; i < 16; i++) {
      const pixels = this.ui.rows[i].querySelectorAll('.pixel');
      this._clearPreviousAnimation(pixels);
      
      // On the current column any cell can either be:
      // - a sound we need to make
      // - empty, in which case we paint the green time bar.
      
      // Is the current cell at this time a sound?
      const sound = this.data[i][currentColumn].on
      if (sound) {
        // Start a ripple from here!
        this.ripples.push({x: i, y: currentColumn, distance: 0, sound:sound});
        
        // It's a note getting struck.
        pixels[currentColumn].classList.add('active');
      
        // Play the note.
        if (sound === 1) {
          noiseyMakey.playSynth(i);
        } else {
          noiseyMakey.playDrum(i);
        }
      } else {
        // It's not a sound, it is a time bar.
        pixels[currentColumn].classList.add('bar');
      }
    }
    this.draw();
  }
  
  // Remove animation artifacts like the green bar line and the ripples.
  clearAnimation() {
    this.ripples = [];
    const bars = this.ui.container.querySelectorAll('.bar');
    const rips = this.ui.container.querySelectorAll('.ripple');
    const actives = this.ui.container.querySelectorAll('.active');
    
    for (let bar of bars) {
      bar.classList.remove('bar');
    }
    for (let rip of rips) {
      rip.classList.remove('ripple');
    } 
    for (let active of actives) {
      active.classList.remove('active');
    } 
  }
  
  _clearPreviousAnimation(row) {
    for (let j = 0; j < 16; j++) {
      row[j].classList.remove('bar');
      row[j].classList.remove('active');
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
    let didIt = false;
    if (dataCell.on) {
      uiCell.classList.add('on');
      
      // You may have clicked on this when it was part of a ripple.
      uiCell.classList.remove('ripple');
      
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
      // A distance is sqrt[(x1-x2)^2 + (y1-y2)^2]
      let distanceFromRippleCenter = Math.sqrt((i-ripple.x)*(i-ripple.x) + (j-ripple.y)*(j-ripple.y));
      
      // If you're in this magical donut with magical numbers I crafted
      // by hand, then congratulations: you're a ripple cell!
      if(distanceFromRippleCenter > ripple.distance - 0.7 && 
         distanceFromRippleCenter < ripple.distance + 0.7 &&
         distanceFromRippleCenter < 3.5) {
        uiCell.classList.add('ripple');
        uiCell.classList.add(ripple.sound === 1 ? 'synth' : 'drums');
      }
    }
  }
}