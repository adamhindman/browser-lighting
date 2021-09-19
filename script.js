// console.clear();
let deltaX, deltaY, deg, distance;
let newPosX = 0,
  newPosY = 0,
  startPosX = 0,
  startPosY = 0;
const lightSource = document.getElementById("light-source");
const solids = document.querySelectorAll(".solid");
let solidsData = getSolidsData(); // global
let lum = 75; // lum is luminous intensity

function fpsMeter() {
  let prevTime = Date.now(),
    frames = 0;

  requestAnimationFrame(function loop() {
    const time = Date.now();
    frames++;
    if (time > prevTime + 1000) {
      let fps = Math.round((frames * 1000) / (time - prevTime));
      prevTime = time;
      frames = 0;

      console.info("FPS: ", fps);
    }

    requestAnimationFrame(loop);
  });
}

const getRelativeVector = (angle, length) => {
  angle = (angle * Math.PI) / 180;
  return {
    x: length * Math.cos(angle),
    y: length * Math.sin(angle)
  };
};

const setBoxShadow = (solid, vec, distance, e, isInset) => {
  const b = distance; // blur
  const l = 8; // number of shadow layers
  const c = "hsla(220deg, 60%, 50%, .25)"; // shadow color
  const x = -vec.x; // x offset
  const y = -vec.y; // y offset
  let sf = 1000; // scaleFactor
  let str = "";
  for (let i = 1; i <= l; i++) {
    const delimiter = i < l ? "," : "";
    const location = isInset ? "inset" : "";
    str += `${location}
            ${Math.round(((x / i) * e * lum) / sf)}px 
            ${Math.round(((y / i) * e * lum) / sf)}px 
            ${Math.round(((b / i) * e * lum) / sf)}px 
            ${c} ${delimiter}`;
  }
  if (isInset) {
    str += `,
          ${Math.round(((x / l) * e * lum) / sf)}px 
          ${Math.round(((y / l) * e * lum) / sf)}px 
          ${Math.round(((b / l) * e * lum) / sf)}px 
          rgba(255,255,255,.95)
    `;
  }
  solid.style.boxShadow = str;
};

const updateAllShadows = () => {
  // still assumes one light source
  const lsRect = lightSource.getBoundingClientRect();
  const lsCenterX = lsRect.x + lsRect.width / 2;
  const lsCenterY = lsRect.y + lsRect.height / 2;
  for (let i = 0; i < solidsData.length; i++) {
    let dX = lsCenterX - solidsData[i].centerX;
    let dY = lsCenterY - solidsData[i].centerY;
    let angle = getAngleToPageObject(dX, dY);
    let distance = getDistanceToPageObject(dX, dY);
    let vec = getRelativeVector(angle, distance, 0, 0);
    let elevation = solidsData[i].elevation;
    let isInset = solidsData[i].isInset;
    setBoxShadow(solids[i], vec, distance, elevation, isInset);
  }
};

const getAngleToPageObject = (dX, dY) => {
  return (angle = Math.atan2(dY, dX) * (180 / Math.PI));
};

const getDistanceToPageObject = (dX, dY) => {
  return (distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2)));
};

const pointerMove = (e) => {
  // calculate the new position
  newPosX = startPosX - e.clientX;
  newPosY = startPosY - e.clientY;
  // with each move we also want to update the start X and Y
  startPosX = e.clientX;
  startPosY = e.clientY;
  // set the element's new position:
  lightSource.style.top = lightSource.offsetTop - newPosY + "px";
  lightSource.style.left = lightSource.offsetLeft - newPosX + "px";

  updateAllShadows(); // perhaps debounce?
};

function getSolidsData() {
  let solidsData = [];
  solids.forEach((v, i) => {
    rect = v.getBoundingClientRect();
    solidsData.push({
      centerX: rect.x + rect.width / 2,
      centerY: rect.y + rect.height / 2,
      elevation: v.dataset.elevation || 1,
      isInset: v.classList.contains("inset")
    });
  });
  return solidsData;
}

lightSource.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  // get the starting position of the cursor
  startPosX = e.clientX;
  startPosY = e.clientY;
  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("pointerup", function () {
    document.removeEventListener("pointermove", pointerMove);
  });
});

window.addEventListener("resize", () => {
  solidsData = getSolidsData();
  updateAllShadows();
  (newPosX = 0), (newPosY = 0), (startPosX = 0), (startPosY = 0);
});

const updateUI = () => {
  const adjLum = lum / 25;
  lightSource.innerHTML = adjLum;
};

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    lum = lum < 250 ? (lum += 25) : 275;
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    lum = lum > 25 ? (lum -= 25) : 0;
  }
  updateAllShadows();
  updateUI();
});

updateAllShadows();
updateUI();
// fpsMeter();
