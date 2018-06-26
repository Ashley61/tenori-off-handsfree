let isMouseDown = false;
let isAnimating = false;

const noiseyMakey = new NoiseyMakey();
const board = new Board();

init();

function init() {
  // If there is a location, parse it.
  if (window.location.hash) {
    try {
      board.data = decode(window.location.hash.slice(1));
      board.draw();
    } catch(err) {
      window.location.hash = 'not-a-valid-pattern-url';
    }
  }
  
  // Set upvent listeners.
  document.getElementById('container').addEventListener('mousedown', (event) => {isMouseDown = true; clickCell(event)});
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', clickCell);
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

function reset(clearLocation = false) {
  board.reset();
  
  if (clearLocation) {
    window.location.hash = '';
  }
}

function clickCell(event) {
  const button = event.target;
  
  // We only care about clicking on the buttons, not the container itself.
  if (button.localName !== 'button' || !isMouseDown) {
    return;
  }
  
  const x = parseInt(button.dataset.row);
  const y = parseInt(button.dataset.col);
  board.toggleCell(x, y, noiseyMakey.getSound());
  window.location.hash = `#${encode(board.data)}`;
}

let animationIndex;
function animate() {
  let currentColumn = 0;
  animationIndex = setTimeout(step, 100);
  
  const rows = document.querySelectorAll('.container > .row');
  
  // An animation step.
  function step() {
    // Draw the board at this step.
    noiseyMakey.resetDrums();
    board.animate(currentColumn, noiseyMakey);
    
    // Get ready for the next column.
    currentColumn++;
    if (currentColumn === 16) {
      currentColumn = 0;
    }
    
    // Did we get paused mid step?
    if (isAnimating) {
      setTimeout(step, 100);
    } else {
      clearTimeout(animationIndex);
      currentColumn = 0;
      board.clearAnimation();
    }
  }
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
  board.draw();
}

/***********************************
 * UI actions
 ***********************************/

function playOrPause() {
  const container = document.getElementById('container');
  
  if (isAnimating) {
    container.classList.remove('playing');
    //clearTimeout(animationIndex);
    noiseyMakey.pause();
    
  } else {
    container.classList.add('playing');
    animate();
    noiseyMakey.play();
  }
  
  isAnimating = !isAnimating;
  document.getElementById('btnPlay').textContent = isAnimating? 'Pause' : 'Play!';
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
  helpBox.hidden = !helpBox.hidden;
}

/***********************************
 * Save and load application state
 ***********************************/
function encode(arr) {
  let bits = '';
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      bits += arr[i][j].on ? arr[i][j].on : 0;
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


