class State {
  constructor() {
    this.dots = [];
    this.ripples = [];
    this.isMouseDown = false;
    this.isPlaying = false;
    this.isSynth = false;
  }
}

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
    let gain  = new Tone.Gain(0.5);
  
    synth.connect(gain);
    gain.toMaster();
  }
  
  playSynth() {
  }
  
  clearDrum(which) {
    this.drumSounds[which].stop();
  }
  playDrum(which) {
    this.drumSounds[which].start(Tone.now(), 0);
  }
}

let dots = [];
let ripples = [];
let isMouseDown = false;
let isPlaying = false;
let isSynth = true;

let synth;



init();

let noiseyMakey;
function init() {
  noiseyMakey = new NoiseyMakey();
  
  // Draw the grid.
  reset();
  
  // If there is a location, parse it.
  if (window.location.hash) {
    try {
      dots = decode(window.location.hash.slice(1));
      draw();
    } catch(err) {
      window.location.hash = 'not-a-valid-pattern-url';
    }
  }

  //document.getElementById('container').addEventListener('click', activate);
  document.getElementById('container').addEventListener('mousedown', (event) => {isMouseDown = true; activate(event)});
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', activate);
  document.body.addEventListener('keypress', (event) => {
    if (event.keyCode == 115) { // s
      playSynth();
      event.preventDefault();
    } else if (event.keyCode == 100) { // d
      playDrums();
      event.preventDefault();
    } else if (event.keyCode == 112) { // p
      playOrPause();
      event.preventDefault();
    }
  });
  
}

function reset(updateLocation = false) {
  const container = document.getElementById('container');
  dots = [];
  ripples = [];
  container.innerHTML = '';
  
  for (let i = 0; i < 16; i++) {
    let row = [];
    dots.push(row);
    const rowEl = document.createElement('div');
    rowEl.classList.add('row');
    container.appendChild(rowEl);
    
    for (let j = 0; j < 16; j++) {
      dots[i][j] = {};
      
      const button = document.createElement('button');
      button.classList.add('pixel');
      button.dataset.row = i;
      button.dataset.col = j;
      rowEl.appendChild(button);
    }
  }
  draw();
  
  if (updateLocation) {
    window.location.hash = '';
  }
}
  
function draw() {
  // First, advance all the ripples.
  for (let i = 0; i < ripples.length; i++) {
    if (ripples[i].distance > 6) {
        ripples.splice(i, 1);
    } else {
      ripples[i].distance += 1;
    }
  }

  const rows = document.querySelectorAll('.container > .row');
  for (let i = 0; i < 16; i++) {
    const pixels = rows[i].querySelectorAll('.pixel');
    for (let j = 0; j < 16; j++) {
      const dot = dots[i][j];
      
      if (dot.on) {
        pixels[j].classList.add('on');
        pixels[j].classList.remove('drums');
        pixels[j].classList.remove('synth');
        
        pixels[j].classList.add(dot.on === 1 ? 'synth' : 'drums');
        continue;
      } else {
        pixels[j].classList.remove('on');
      }

      // Clear the old ripple, if it exists.
      pixels[j].classList.remove('ripple');
      
      // Is this pixel inside a ripple?
      for(let r = 0; r < ripples.length; r++) {
        const ripple = ripples[r];
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
}

function activate(event) {
  const button = event.target;
  // We only care about clicking on the buttons, not the container itself.
  if (button.localName !== 'button' || !isMouseDown) {
    return;
  }
  
  const isOn = button.classList.contains('on');
  const x = parseInt(button.dataset.row);
  const y = parseInt(button.dataset.col);
  
  const dot = dots[x][y];
  if (isOn) {
    dot.on = 0;
  } else {
    dot.on = isSynth ? 1 : 2;
  }
  
  window.location.hash = `#${encode(dots)}`;
  
  draw();
}

let playTimeout;
function play() {
  let currentColumn = 0;
  const rows = document.querySelectorAll('.container > .row');
  
  function playStep() {
    let playSynth = false;
    
    // Every new full frame, add ripples for the dots that are on.
    for (let i = 0; i < 16; i++) {
      const pixels = rows[i].querySelectorAll('.pixel');
      
      // Reset the previous frame.
      for (let j = 0; j < 16; j++) {
        pixels[j].classList.remove('now');
        pixels[j].classList.remove('active');
        
        noiseyMakey.clearDrum(i);
      }
      
      if (dots[i][currentColumn].on) {
        ripples.push({x: i, y: currentColumn, distance: 0, synth: dots[i][currentColumn].on === 1});
        pixels[currentColumn].classList.add('active');
      
        // Play the note.
        const playSynth = dots[i][currentColumn].on === 1;
        if (playSynth) {
          noiseyMakey.playSynth(i);
        } else {
          noiseyMakey.playDrum(i);
        }
      } else {
        pixels[currentColumn].classList.add('now');
      }
    }
    
    draw();
    
    // Get ready for the next column.
    currentColumn++;
    if (currentColumn === 16) {
      currentColumn = 0;
    }
    if (isPlaying) {
      setTimeout(playStep, 100);
    } else {
      clearTimeout(playTimeout);
      currentColumn = 0;
    }
  }
  playTimeout = setTimeout(playStep, 100);
}


/***********************************
 * Sample demos
 ***********************************/
function loadDemo(which) {
  switch(which) {
    case 1:
      dots = JSON.parse('[[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{"on":0},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{"on":2},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{"on":2},{},{},{"on":0},{"on":2},{},{},{},{"on":2},{},{},{},{"on":2},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":0},{"on":0},{"on":0},{},{"on":1},{},{"on":1},{},{},{},{},{},{},{}],[{},{"on":0},{"on":0},{"on":0},{},{"on":0},{},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1}],[{"on":0},{"on":0},{"on":1},{},{"on":0},{"on":0},{"on":0},{"on":0},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1},{}]]');
      break;
    case 2:
      dots = JSON.parse('[[{"on":2},{"on":0},{"on":0},{},{"on":2},{"on":0},{"on":0},{},{"on":2},{"on":0},{"on":0},{},{"on":2},{},{"on":0},{"on":0}],[{"on":0},{"on":0},{},{},{"on":0},{},{},{},{},{},{},{"on":2},{"on":0},{"on":2},{"on":0},{"on":2}],[{},{},{"on":2},{},{},{},{"on":2},{},{},{},{"on":2},{},{},{},{"on":2},{}],[{},{"on":0},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{}],[{},{},{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{},{},{}],[{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":0},{"on":1},{},{},{},{},{},{},{"on":0},{"on":2},{"on":0},{},{"on":0},{}],[{"on":0},{"on":0},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{"on":0},{},{"on":0},{"on":2},{},{"on":2},{},{"on":2},{},{},{}],[{},{"on":0},{},{},{},{"on":0},{},{},{},{},{},{},{"on":0},{"on":1},{},{}],[{},{},{},{},{"on":0},{},{},{},{},{},{},{"on":0},{"on":1},{},{},{}],[{},{},{},{"on":1},{},{},{},{},{},{},{},{},{"on":0},{},{},{}],[{},{"on":0},{"on":0},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":0},{},{"on":0},{},{},{},{},{},{},{},{},{},{},{}]]');
      break;
    case 3:
    default:
      dots = JSON.parse('[[{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{},{},{},{"on":1},{},{},{"on":1},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{},{"on":2},{},{"on":2},{"on":2},{},{"on":2},{"on":2}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{},{},{}],[{},{},{},{},{"on":1},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{"on":1},{},{},{},{},{},{},{},{"on":1},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{"on":1},{},{},{}],[{},{},{"on":1},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{"on":1},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{"on":1},{},{},{},{},{},{},{},{},{},{},{"on":1},{},{},{}],[{},{"on":1},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{"on":1},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1},{},{},{},{}]]');
      break;
  }
  window.location.hash = `#${encode(dots)}`;
  draw();
}

/***********************************
 * UI actions
 ***********************************/

function playOrPause() {
  const container = document.getElementById('container');
  const btn = document.getElementById('btnPlay');
  if (isPlaying) {
    container.classList.remove('playing');
    clearTimeout(playTimeout);
    isPlaying = false;
    Tone.Transport.pause();
  } else {
    container.classList.add('playing');
    play();
    isPlaying = true;
    Tone.context.resume();
    Tone.Transport.start();
  }
  btn.textContent = isPlaying ? 'Pause' : 'Play!';
}

function playSynth() {
  isSynth = true;
  document.getElementById('btnSynth').classList.add('synth');
  document.getElementById('btnDrums').classList.remove('drums');
}

function playDrums() {
  isSynth = false;
  document.getElementById('btnSynth').classList.remove('synth');
  document.getElementById('btnDrums').classList.add('drums');
}

function showHelp() {
  const helpBox = document.getElementById('help');
  if (helpBox.hidden) {
    helpBox.hidden = false;
  } else {
    helpBox.hidden = true;
  }
}

/***********************************
 * Save and load application state
 ***********************************/

function encode(arr) {
  let bits = ''
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if (arr[i][j].on) {
        bits += arr[i][j].on
      } else {
        bits += 0;
      }
    }
  }
  return bits;
}

function decode(bits) {
  const arr = [];
  for (let i = 0; i < 16; i++) {
    let row = [];
    arr.push(row);
    for (let j = 0; j < 16; j++) {
      arr[i][j] = {};
      const c = bits.charAt(i * 16 + j);
      if (c != '0') {
        arr[i][j].on = parseInt(c);
      }
    }
  }
  return arr;
}