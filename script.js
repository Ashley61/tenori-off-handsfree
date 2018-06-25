let dots = [];
init();
draw();

function init() {
  for (let i = 0; i < 16; i++) {
    let row = [];
    dots.push(row);
    for (let j = 0; j < 16; j++) {
      dots[i][j] = 0;
    }
  }
}

function enableSome() {
  dots[3][5] = 1;
  draw();
}

function draw() {
  const rows = document.querySelectorAll('.container > .row');
  for (let i = 0; i < 16; i++) {
    const pixels = rows[i].querySelectorAll('.pixel');
    for (let j = 0; j < 16; j++) {
      pixels[j].classList.remove('on');
      if (dots[i][j]) {
        pixels[j].classList.add('on');
      }
    }
  }
}