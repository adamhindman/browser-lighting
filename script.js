console.clear();
let deltaX, deltaY, deg, distance;
let newPosX = 0,
  newPosY = 0,
  startPosX = 0,
  startPosY = 0;
const lightSource = document.getElementById("light-source");
const solids = document.querySelectorAll(".solid");

const getRelativeVector = (angle, length) => {
  angle = (angle * Math.PI) / 180;
  return {
    x: length * Math.cos(angle),
    y: length * Math.sin(angle)
  };
};

const setBoxShadow = (solid, vec, distance, e, isInset) => {
  const blur = distance;
  const levels = 4;
  const cd = 10; // cd is luminous intensity (smaller is more)
  const color = "hsla(220deg, 60%, 50%, .25)";
  const x = -vec.x;
  const y = -vec.y;  
  let str = "";
  for (let i = 1; i <= levels; i++) {
    const delimiter = i < levels ? "," : "";
    const location = isInset ? "inset" : "";
    str += `${location}
            ${Math.round(x / (i * cd) * e)}px 
            ${Math.round(y / (i * cd) * e)}px 
            ${Math.round(blur / (i * cd) * e)}px 
            ${color} ${delimiter}`;
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
    let isInset = solidsData[i].isInset
    setBoxShadow(solids[i], vec, distance, elevation, isInset);
  }
};

const getAngleToPageObject = (dX, dY) => {
  return (angle = Math.atan2(dY, dX) * (180 / Math.PI));
};

const getDistanceToPageObject = (dX, dY) => {
  return (distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2)));
};

const mouseMove = (e) => {
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

lightSource.addEventListener("mousedown", function (e) {
  e.preventDefault();
  // get the starting position of the cursor
  startPosX = e.clientX;
  startPosY = e.clientY;
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", mouseMove);
  });
});

let solidsData = getSolidsData(); // global
window.addEventListener("resize", () => {
  solidsData = getSolidsData();
  updateAllShadows();
  (newPosX = 0), (newPosY = 0), (startPosX = 0), (startPosY = 0);
});
updateAllShadows();
