let dots = [];
let ripples = [];
let isMouseDown = false;
let isPlaying = false;
let synth;

const SYNTH = ['B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 
               'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3', 
               'B2', 'A2', 'G2', 'F2'];

// From https://codepen.io/teropa/pen/JLjXGK
let sampleBaseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699';

let reverb = new Tone.Convolver(
  `${sampleBaseUrl}/small-drum-room.wav`
).toMaster();
reverb.wet.value = 0.35;

let snarePanner = new Tone.Panner().connect(reverb);
new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan).start();

let DRUMS = [
  new  Tone.Player({
    med: `${sampleBaseUrl}/808-kick-vm.mp3`,
    low: `${sampleBaseUrl}/808-kick-vl.mp3`
  }).toMaster(),
  new  Tone.Player({
    high: `${sampleBaseUrl}/flares-snare-vh.mp3`,
    med: `${sampleBaseUrl}/flares-snare-vm.mp3`,
    low: `${sampleBaseUrl}/flares-snare-vl.mp3`
  }).connect(snarePanner),
  new  Tone.Player({
    high: `${sampleBaseUrl}/808-hihat-vh.mp3`,
    med: `${sampleBaseUrl}/808-hihat-vm.mp3`,
    low: `${sampleBaseUrl}/808-hihat-vl.mp3`
  }).connect(new Tone.Panner(-0.5).connect(reverb)),
  new  Tone.Player({
    high: `${sampleBaseUrl}/808-hihat-open-vh.mp3`,
    med: `${sampleBaseUrl}/808-hihat-open-vm.mp3`,
    low: `${sampleBaseUrl}/808-hihat-open-vl.mp3`
  }).connect(new Tone.Panner(-0.5).connect(reverb)),
  new  Tone.Player({
    high: `${sampleBaseUrl}/slamdam-tom-low-vh.mp3`,
    med: `${sampleBaseUrl}/slamdam-tom-low-vm.mp3`,
    low: `${sampleBaseUrl}/slamdam-tom-low-vl.mp3`
  }).connect(new Tone.Panner(-0.4).connect(reverb)),
  new  Tone.Player({
    high: `${sampleBaseUrl}/slamdam-tom-mid-vh.mp3`,
    med: `${sampleBaseUrl}/slamdam-tom-mid-vm.mp3`,
    low: `${sampleBaseUrl}/slamdam-tom-mid-vl.mp3`
  }).connect(reverb),
  new  Tone.Player({
    high: `${sampleBaseUrl}/slamdam-tom-high-vh.mp3`,
    med: `${sampleBaseUrl}/slamdam-tom-high-vm.mp3`,
    low: `${sampleBaseUrl}/slamdam-tom-high-vl.mp3`
  }).connect(new Tone.Panner(0.4).connect(reverb)),
  new  Tone.Player({
    high: `${sampleBaseUrl}/909-clap-vh.mp3`,
    med: `${sampleBaseUrl}/909-clap-vm.mp3`,
    low: `${sampleBaseUrl}/909-clap-vl.mp3`
  }).connect(new Tone.Panner(0.5).connect(reverb)),
  new  Tone.Player({
    high: `${sampleBaseUrl}/909-rim-vh.wav`,
    med: `${sampleBaseUrl}/909-rim-vm.wav`,
    low: `${sampleBaseUrl}/909-rim-vl.wav`
  }).connect(new Tone.Panner(0.5).connect(reverb))
];

init();

function init() {
  // Set up tone
  // http://tonejs.org/docs/#DuoSynth
  synth = new Tone.DuoSynth();
  let gain  = new Tone.Gain(0.5);
  synth.connect(gain);
  gain.toMaster();

  //synth = new Tone.PolySynth(4, Tone.MonoSynth); //ew Tone.DuoSynth();
  synth.voice0.oscillator.type = 'triangle';
  synth.voice1.oscillator.type = 'triangle';


  // Draw the grid.
  reset();
  
  //document.getElementById('container').addEventListener('click', activate);
  document.getElementById('container').addEventListener('mousedown', (event) => {isMouseDown = true; activate(event)});
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', activate);
}

function reset() {
  const container = document.getElementById('container');
  ripples = [];
  container.innerHTML = '';
  
  for (let i = 0; i < 16; i++) {
    let row = [];
    dots.push(row);
    const rowEl = document.createElement('div');
    rowEl.classList.add('row');
    container.appendChild(rowEl);
    
    for (let j = 0; j < 16; j++) {
      dots[i][j] = {on:false, opacity: 1, ripple: false};
      
      const button = document.createElement('button');
      button.classList.add('pixel');
      button.dataset.row = i;
      button.dataset.col = j;
      rowEl.appendChild(button);
    }
  }
  draw();
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
  dot.on = isOn ? 0 : 1;
  draw();
}

let playTimeout;
function play() {
  let currentColumn = 0;
  const rows = document.querySelectorAll('.container > .row');
  
  function playStep() {
    let playNoteOnThisColumn = -1;
    // Every new full frame, add ripples for the dots that are on.
    for (let i = 0; i < 16; i++) {
      const pixels = rows[i].querySelectorAll('.pixel');
      
      // Reset the previous frame.
      for (let j = 0; j < 16; j++) {
        pixels[j].classList.remove('now');
        pixels[j].style.opacity = 1;
      }
      
      if (dots[i][currentColumn].on) {
        ripples.push({x: i, y: currentColumn, distance: 0});
        playNoteOnThisColumn = i;
      } else {
        pixels[currentColumn].classList.add('now');
      }
    }
    
    // Play the note
    if (playNoteOnThisColumn !== -1) {
      //synth.triggerAttackRelease(SYNTH[playNoteOnThisColumn], '16n');
      DRUMS[0].get('med').start();
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

function playOrPause() {
  const container = document.getElementById('container');
  if (isPlaying) {
    container.classList.remove('playing');
    clearTimeout(playTimeout);
    isPlaying = false;
    Tone.Transport.pause();
  } else {
    container.classList.add('playing');
    play();
    isPlaying = true;
    Tone.Transport.start();
  }
  updateButtons(isPlaying);
}

function updateButtons(isPlaying) {
  const btn = document.getElementById('btnPlay');
  if (isPlaying) {
    btn.textContent = btn.title = 'Pause';
  } else {
    btn.textContent = btn.title = 'Play';
  }
}


function Ripple(x, y, distance) {
  this.x = x;
  this.y = y;
  this.distance = distance;
  this.draw = function() {
  }
}