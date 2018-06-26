let isMouseDown = false;

const noiseyMakey = new NoiseyMakey();
const board = new Board();

init();

function init() {
  // If there is a location, parse it.
  if (window.location.hash) {
    try {
      board.data = decode(window.location.hash.slice(1));
      draw();
    } catch(err) {
      window.location.hash = 'not-a-valid-pattern-url';
    }
  }
  
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
  board.reset();
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
      const dot = board.data[i][j];
      
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
  
  board.toggle(parseInt(button.dataset.row), parseInt(button.dataset.col), noiseyMakey.getSound());
  window.location.hash = `#${encode(board.data)}`;
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
      
      if (board.data[i][currentColumn].on) {
        ripples.push({x: i, y: currentColumn, distance: 0, synth: board.data[i][currentColumn].on === 1});
        pixels[currentColumn].classList.add('active');
      
        // Play the note.
        const playSynth = board.data[i][currentColumn].on === 1;
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
    if (board.isPlaying) {
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
      board.data = JSON.parse('[[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{"on":0},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{"on":2},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{"on":2},{},{},{"on":0},{"on":2},{},{},{},{"on":2},{},{},{},{"on":2},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":0},{"on":0},{"on":0},{},{"on":1},{},{"on":1},{},{},{},{},{},{},{}],[{},{"on":0},{"on":0},{"on":0},{},{"on":0},{},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1}],[{"on":0},{"on":0},{"on":1},{},{"on":0},{"on":0},{"on":0},{"on":0},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1},{}]]');
      break;
    case 2:
      board.data = JSON.parse('[[{"on":2},{"on":0},{"on":0},{},{"on":2},{"on":0},{"on":0},{},{"on":2},{"on":0},{"on":0},{},{"on":2},{},{"on":0},{"on":0}],[{"on":0},{"on":0},{},{},{"on":0},{},{},{},{},{},{},{"on":2},{"on":0},{"on":2},{"on":0},{"on":2}],[{},{},{"on":2},{},{},{},{"on":2},{},{},{},{"on":2},{},{},{},{"on":2},{}],[{},{"on":0},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{}],[{},{},{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{},{},{}],[{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":0},{"on":1},{},{},{},{},{},{},{"on":0},{"on":2},{"on":0},{},{"on":0},{}],[{"on":0},{"on":0},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{"on":0},{},{"on":0},{"on":2},{},{"on":2},{},{"on":2},{},{},{}],[{},{"on":0},{},{},{},{"on":0},{},{},{},{},{},{},{"on":0},{"on":1},{},{}],[{},{},{},{},{"on":0},{},{},{},{},{},{},{"on":0},{"on":1},{},{},{}],[{},{},{},{"on":1},{},{},{},{},{},{},{},{},{"on":0},{},{},{}],[{},{"on":0},{"on":0},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":0},{},{"on":0},{},{},{},{},{},{},{},{},{},{},{}]]');
      break;
    case 3:
    default:
      board.data = JSON.parse('[[{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{},{},{},{"on":1},{},{},{"on":1},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{"on":2},{},{"on":2},{},{"on":2},{"on":2},{},{"on":2},{"on":2}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{"on":1},{"on":1},{},{},{},{},{},{},{},{}],[{},{},{},{},{"on":1},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{"on":1},{},{},{},{},{},{},{},{"on":1},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{"on":1},{},{},{}],[{},{},{"on":1},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{"on":1},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{"on":1},{},{},{},{},{},{},{},{},{},{},{"on":1},{},{},{}],[{},{"on":1},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{"on":1},{},{},{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{"on":1},{},{"on":1},{},{"on":1},{},{"on":1},{},{},{},{}]]');
      break;
  }
  window.location.hash = `#${encode(board.data)}`;
  draw();
}

/***********************************
 * UI actions
 ***********************************/

function playOrPause() {
  const container = document.getElementById('container');
  const btn = document.getElementById('btnPlay');
  if (board.isPlaying) {
    container.classList.remove('playing');
    clearTimeout(playTimeout);
    
    noiseyMakey.pause();
    board.pause();
  } else {
    container.classList.add('playing');
    play();
    board.play();
    noiseyMakey.play();
  }
  btn.textContent = board.isPlaying ? 'Pause' : 'Play!';
}

function playSynth() {
  noiseyMakey.isSynth = true;
  document.getElementById('btnSynth').classList.add('synth');
  document.getElementById('btnDrums').classList.remove('drums');
}

function playDrums() {
  noiseyMakey.isSynth = false;
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


