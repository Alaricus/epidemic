const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const populationInput = document.querySelector('#population');
const infectedInput = document.querySelector('#infected');
const illnessTimeInput = document.querySelector('#illnessTime');
const recoveryTimeInput = document.querySelector('#recoveryTime');
const oddsOfDeathInput = document.querySelector('#oddsOfDeath');
const velocityInput = document.querySelector('#velocity');
const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
const form = document.querySelector('form');

const results = document.querySelector('#results');
const resultsHealthy = document.querySelector('#resultsHealthy');
const resultsIll = document.querySelector('#resultsIll');
const resultsContageous = document.querySelector('#resultsContageous');
const resultsRecovered = document.querySelector('#resultsRecovered');
const resultsDead = document.querySelector('#resultsDead');

let population = null;
let infected = null;
let illnessTime = null;
let recoveryTime = null;
let oddsOfDeath = null;
let velocity = null;
let width = null;
let height = null;

let people = null;
let animID = null;

const stats = {
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0
};

const tick = 33;
let prev = Date.now();

const statuses = {
  '1': 'forestgreen',  // healthy
  '2': 'red',          // sick
  '3': 'gold',         // recovering but contageous
  '4': 'royalblue',    // recovered and immune
  '5': 'darkgray'      // dead
};

const makePerson = maxVelocity => ({
  x: Math.floor(Math.random() * Math.floor(width)),
  y: Math.floor(Math.random() * Math.floor(height)),
  r: 5,
  vx: Math.random() * (velocity * 2) - velocity,
  vy: Math.random() * (velocity * 2) - velocity,
  s: 1,
  t: null
});

const isCollided = (a, b) => {
  const d1 = a.x - b.x;
  const d2 = a.y - b.y;
  const d = Math.sqrt(d1**2 + d2**2);
  return d <= a.r + b.r;
};

const bounce = v => {
  if (v < 0) {
    return Math.random() * velocity;
  }
  if (v > 0) {
    return Math.random() * -velocity;
  }
  return 0;
}

const init = () => {
  population = populationInput.value || 100;
  infected = infectedInput.value || 1;
  illnessTime = illnessTimeInput.value * 1000;
  recoveryTime = recoveryTimeInput.value * 1000;
  oddsOfDeath = oddsOfDeathInput.value || 2;
  velocity = velocityInput.value || 0.5
  width = widthInput.value || 600;
  height = heightInput.value || 300;

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  people = [];

  for (let i = 0; i < population; i++) {
    people.push(makePerson(velocity));
    if (infected > 0) {
      people[people.length - 1].s = 2;
      people[people.length - 1].t = Date.now();
      infected -= 1;
    }
  }
};

const update = () => {
  stats['1'] = 0;
  stats['2'] = 0;
  stats['3'] = 0;
  stats['4'] = 0;
  stats['5'] = 0;

  people.forEach((person, i) => {
    person.x += person.vx;
    person.y += person.vy;
    if (person.y > height - person.r) {
      person.y = height - person.r;
      person.vy = bounce(person.vy);
    }
    if (person.y < 0 + person.r) {
      person.y = 0 + person.r;
      person.vy = bounce(person.vy);
    }
    if (person.x > width - person.r) {
      person.x = width - person.r;
      person.vx = bounce(person.vx);
    }
    if (person.x < 0 + person.r) {
      person.x = 0 + person.r;
      person.vx = bounce(person.vx);
    }

    for (let j = i + 1; j < people.length; j++) {
      const p = people[j];

      if (isCollided(person, p)) {
        if (person.x >= p.x) {
          person.vy = bounce(person.vy);
        }
        if (person.y >= p.y) {
          person.vx = bounce(person.vx);
        }
        if ((person.s === 2 || person.s === 3) && p.s === 1) {
          p.s = 2;
          p.t = Date.now();
        }
        if ((p.s === 2 || p.s === 3) && person.s === 1) {
          person.s = 2;
          person.t = Date.now();
        }
      }
    }

    if (person.s === 2 && Date.now() - person.t >= illnessTime) {
      if (oddsOfDeath !== 0 && Math.floor(Math.random() * 101) <= oddsOfDeath) {
        person.s = 5;
        person.vx = 0;
        person.vy = 0;
      } else {
        person.s = 3;
      }
    }
    if (person.s === 3 && Date.now() - person.t >= illnessTime + recoveryTime) {
      person.s = 4;
    }

    stats[person.s] += 1;

    resultsHealthy.value = stats['1'] || 0;
    resultsIll.value = stats['2'] || 0;
    resultsContageous.value = stats['3'] || 0;
    resultsRecovered.value = stats['4'] || 0;
    resultsDead.value = stats['5'] || 0;
  });


  if (stats['2'] === 0 && stats['3'] === 0) {
    return false;
  }

  return true;
};

const draw = () => {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  people.forEach(person => {
    ctx.fillStyle = statuses[person.s];
    ctx.beginPath();
    ctx.arc(person.x, person.y, person.r, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const main = () => {
  const now = Date.now();
  let ongoing = null;

  if (prev + tick < now) {
    ongoing = update();
    draw();
    previous = now;
  }

  if (ongoing) {
    animID = requestAnimationFrame(main);
  } else {
    cancelAnimationFrame(animID);
  }
};

form.addEventListener('submit', e => {
  e.preventDefault();
  results.style.display = 'block';
  cancelAnimationFrame(animID);
  init();
  main();
});
