const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const populationInput = document.querySelector('#population');
const infectedInput = document.querySelector('#infected');
const quarantinedInput = document.querySelector('#quarantined');
const illnessTimeInput = document.querySelector('#illnessTime');
const recoveryTimeInput = document.querySelector('#recoveryTime');
const oddsOfReinfectionInput = document.querySelector('#oddsOfReinfection');
const oddsOfDeathInput = document.querySelector('#oddsOfDeath');
const velocityInput = document.querySelector('#velocity');
const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
const form = document.querySelector('form');
const placeholder = document.querySelector('#placeholder');

const resultsHealthy = document.querySelector('#resultsHealthy');
const resultsQuarantined = document.querySelector('#resultsQuarantined');
const resultsIll = document.querySelector('#resultsIll');
const resultsContageous = document.querySelector('#resultsContageous');
const resultsRecovered = document.querySelector('#resultsRecovered');
const resultsReinfected = document.querySelector('#resultsReinfected');
const resultsDead = document.querySelector('#resultsDead');
const resultsDuration = document.querySelector('#resultsDuration');

let population = null;
let infected = null;
let quarantined = null;
let illnessTime = null;
let recoveryTime = null;
let oddsOfReinfection = null;
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
  '5': 0,
  '6': 0,
  '7': 0
};

const start = Date.now();
const tickrate = 33;
let prev = Date.now();

const statuses = {
  '1': 'forestgreen',  // healthy
  '2': '#860000',      // sick
  '3': 'goldenrod',    // recovering but contageous
  '4': 'royalblue',    // recovered and immune
  '5': 'darkgray',     // dead
  '6': 'forestgreen',  // quarantined
  '7': 'magenta'       // reinfected
};

const makePerson = maxVelocity => ({
  x: Math.floor(Math.random() * Math.floor(width)),
  y: Math.floor(Math.random() * Math.floor(height)),
  r: 5,
  vx: Math.random() * (velocity * 2) - velocity,
  vy: Math.random() * (velocity * 2) - velocity,
  s: 1,    // status
  t: null  // timestamp
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
};

const infect = p => {
  if (p.s === 1) {
    p.s = 2;
    p.t = Date.now();
  }
  if (p.s === 4 && Math.floor((Math.random() * 100) + 1) <= oddsOfReinfection) {
    p.s = 7;
    p.t = Date.now();
  }
};

const init = () => {
  population = populationInput.value || 200;
  infected = infectedInput.value || 1;
  quarantined = quarantinedInput.value || 0;
  illnessTime = (illnessTimeInput.value || 6) * 1000;
  recoveryTime = (recoveryTimeInput.value || 2) * 1000;
  oddsOfReinfection = oddsOfReinfectionInput.value || 3;
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
    if (people[people.length - 1].s !== 2 && quarantined > 0) {
      people[people.length - 1].s = 6;
      people[people.length - 1].vx = 0;
      people[people.length - 1].vy = 0;
      quarantined -= 1;
    }
  }
};

const update = () => {
  stats['1'] = 0;
  stats['2'] = 0;
  stats['3'] = 0;
  stats['4'] = 0;
  stats['5'] = 0;
  stats['6'] = 0;
  stats['7'] = 0;

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
        const dx = person.x - p.x;
        const dy = person.y - p.y;

        if (dx <= 0) {
          if (dy <= 0) {
            person.x -= Math.abs(person.vx);
            person.y -= Math.abs(person.vy);
            p.x += Math.abs(p.vx);
            p.y += Math.abs(p.vy);
          } else {
            person.x -= Math.abs(person.vx);
            person.y += Math.abs(person.vy);
            p.x += Math.abs(p.vx);
            p.y -= Math.abs(p.vy);
          }
        }

        if (dx > 0) {
          if (dy <= 0) {
            person.x += Math.abs(person.vx);
            person.y -= Math.abs(person.vy);
            p.x -= Math.abs(p.vx);
            p.y += Math.abs(p.vy);
          } else {
            person.x += Math.abs(person.vx);
            person.y += Math.abs(person.vy);
            p.x -= Math.abs(p.vx);
            p.y -= Math.abs(p.vy);
          }
        }

        if (person.s !== 5 && person.s !== 6) {
          person.vy = bounce(person.vy);
          person.vx = bounce(person.vx);
        }
        if (p.s !== 5 && p.s !== 6) {
          p.vy = bounce(p.vy);
          p.vx = bounce(p.vx);
        }

        if (person.s === 2 || person.s === 3 || p.s === 7) {
          infect(p);
        }
        if (p.s === 2 || p.s === 3 || p.s === 7) {
          infect(person);
        }
      }
    }

    if ((person.s === 2 || person.s === 7) && Date.now() - person.t >= illnessTime) {
      if (Math.floor((Math.random() * 100) + 1) <= oddsOfDeath) {
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
    resultsQuarantined.value = stats['6'] || 0;
    resultsReinfected.value = stats['7'] || 0;
    resultsDuration.value = parseInt((Date.now() - start) / 1000);
  });


  if (stats['2'] === 0 && stats['3'] === 0 && stats['7'] === 0) {
    return false;
  }

  return true;
};

const draw = () => {
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, width, height);

  people.forEach(person => {
    ctx.fillStyle = statuses[person.s];
    ctx.beginPath();
    ctx.arc(person.x, person.y, person.r, 0, 2 * Math.PI);
    ctx.fill();

    if (person.s === 6) {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(person.x, person.y, person.r - 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
};

const main = () => {
  const now = Date.now();
  let ongoing = true;

  if (prev + tickrate < now) {
    ongoing = update();
    draw();
    prev = now;
  }

  if (ongoing) {
    animID = requestAnimationFrame(main);
  } else {
    cancelAnimationFrame(animID);
  }
};

form.addEventListener('submit', e => {
  e.preventDefault();
  cancelAnimationFrame(animID);
  placeholder.style.display = 'none';
  canvas.style.display = 'block';
  init();
  main();
});
