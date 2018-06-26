let dots = [];
let ripples = [];
let isMouseDown = false;
let isPlaying = false;
let synth;

const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'C3', 'D3', 'E3', 'F3', 'G3', 'A4', 'B4', 'C4', 'D4', 'E4', 'F4'];
init();

function init() {
  const container = document.getElementById('container');
  
  // Set up tone
  // http://tonejs.org/docs/#DuoSynth
  synth = new Tone.DuoSynth();
  let gain  = new Tone.Gain(0.5);
  synth.connect(gain);
  gain.toMaster();

  synth.voice0.oscillator.type = 'triangle';
  synth.voice1.oscillator.type = 'triangle';


  // Draw the grid.
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
  
  //document.getElementById('container').addEventListener('click', activate);
  document.getElementById('container').addEventListener('mousedown', (event) => {isMouseDown = true; activate(event)});
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', activate);
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
    let playNoteOnThisColumn = false;
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
        playNoteOnThisColumn = true;
      } else {
        pixels[currentColumn].classList.add('now');
      }
      
      // if (currentColumn > 1) {
      //   pixels[currentColumn - 1].classList.add('now');
      //   pixels[currentColumn - 1].style.opacity = 0.8;
      // }
      // if (currentColumn > 2) {
      //   pixels[currentColumn - 2].classList.add('now');
      //   pixels[currentColumn - 2].style.opacity = 0.4;
      // }
    }
    
    // Play the note
    if (playNoteOnThisColumn)
      synth.triggerAttackRelease(notes[currentColumn], '16n');
    
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
    btn.querySelector('.iconPlay').setAttribute('hidden', true);
    btn.querySelector('.iconPause').removeAttribute('hidden');
    btn.title = 'Pause';
  } else {
    btn.querySelector('.iconPlay').removeAttribute('hidden');
    btn.querySelector('.iconPause').setAttribute('hidden', true);
    btn.title = 'Play';
  }
}


function Ripple(x, y, distance) {
  this.x = x;
  this.y = y;
  this.distance = distance;
  this.draw = function() {
  }
}