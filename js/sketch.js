// sketch.js 

let canvasContainer;
let color = 0;

let sliders = [];
let sliderValues = [];

let velocities = [], deltaCtrs = [], deltas = [], frameRateVals = [];
let oldPositions = [], positions = [];
let numDiscs = 1042;
let radius = 3;
let diameter = radius * 1.5;
let timeStep = 0.01;
let wind = 0.0;
let gravity = 0.9;

function setupSliders() {
    sliders.push(document.getElementById("slider1")); // 0 = Work Slider
    sliders.push(document.getElementById("slider2")); // 1 = Sleep Slider
    sliders.push(document.getElementById("slider3")); // 2 = Therapy Slider
    sliders.push(document.getElementById("slider4")); // 4 = Medication Slider
    sliders.push(document.getElementById("slider5")); // 5 = Diet Slider
    sliders.push(document.getElementById("slider6")); // 6 = Exercise Slider

    for (let i = 0; i < sliders.length; i++) {
        sliderValues.push(sliders[i].value);
        sliders[i].oninput = function() {
            sliderValues[i] = this.value;
            //console.log("Slider " + (i + 1) + " value: " + sliderValues[i]);
        }
    }
}

function resolveParticleCollisions(idxA, idxB) {
    let xa = positions[idxA].x, xb = positions[idxB].x;
    let ya = positions[idxA].y, yb = positions[idxB].y;
    let normalDirX = xa - xb;
    let normalDirY = ya - yb;
    let dist = sqrt(normalDirX * normalDirX + normalDirY * normalDirY);
    let overlapDistance = 2 * radius - dist;
    
    if (overlapDistance > 0 && dist > 0.001) {
        normalDirX /= dist;
        normalDirY /= dist;
        let moveAmount = overlapDistance / 2;
        positions[idxA].x += normalDirX * moveAmount;
        positions[idxA].y += normalDirY * moveAmount;
        positions[idxB].x -= normalDirX * moveAmount;
        positions[idxB].y -= normalDirY * moveAmount;

        let relativeVelocityX = velocities[idxA].x - velocities[idxB].x;
        let relativeVelocityY = velocities[idxA].y - velocities[idxB].y;
        let dotProduct = relativeVelocityX * normalDirX + relativeVelocityY * normalDirY;
        let impulse = dotProduct / 2;
        velocities[idxA].x -= impulse * normalDirX;
        velocities[idxA].y -= impulse * normalDirY * 1.9;
        velocities[idxB].x += impulse * normalDirX;
        velocities[idxB].y += impulse * normalDirY;
    }
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    setupSliders();
    let randomX = 0, randomY = 0;
    let ctr = numDiscs;
    while (ctr >= 0) {
        randomX = random(width);
        randomY = random(height + 50, height + 400);
        velocities.push(createVector((-5 + random(10)) * 0.96, (-5 + random(10)) * 0.34));
        deltaCtrs.push(0);
        deltas.push(createVector(0.0, 0.0));
        positions.push(createVector(randomX, randomY));
        oldPositions.push(createVector(0, 0));
        ctr -= 1;
    }
    noLoop(); 
}


// 
function draw() {
    background(255); // background = white 
    stroke(0); // building outline = black
    strokeWeight(3); 
    
    wind = map(sliderValues[3], 0, 100, -3, 3); // Medication slider controls wind
    gravity = map(sliderValues[2], 0, 100, 9.8, 0.5); // Therapy slider controls intensity (inverted scale for more therapy = less intensity)
    
    let allowRespawning = gravity > 1;
    
    for (let i = 0; i < numDiscs; i++) {
        oldPositions[i].x = positions[i].x;
        oldPositions[i].y = positions[i].y;

        positions[i].x = oldPositions[i].x + timeStep * velocities[i].x + timeStep * wind;
        positions[i].y = oldPositions[i].y + timeStep * velocities[i].y + gravity * timeStep;
        
        velocities[i].x *= 0.97;
        velocities[i].y *= 0.97;

        deltas[i].x = 0.0;
        deltas[i].y = 0.0;
        deltaCtrs[i] = 0;

        for (let j = 0; j < numDiscs; j++) {
            if (i !== j) {
                resolveParticleCollisions(i, j);
            }
        }
        
        if (deltaCtrs[i] > 0) {
            positions[i].x += 1.2 * deltas[i].x / deltaCtrs[i];
            positions[i].y += 1.2 * deltas[i].y / deltaCtrs[i];
        }

        velocities[i].x = 0.9999 * (positions[i].x - oldPositions[i].x) / timeStep;
        velocities[i].y = 0.9999 * (positions[i].y - oldPositions[i].y) / timeStep;

        fill(110, 150, 255);
        ellipse(positions[i].x, positions[i].y, diameter, diameter);

        if (positions[i].y > height + 200) {
            if (allowRespawning) {
                positions[i].y = random(-200, -50);
                positions[i].x = random(width);
                velocities[i].y = random(1, 3);
            }
        }

        if (positions[i].x < -50) {
            positions[i].x = width + 50;
        } else if (positions[i].x > width + 50) {
            positions[i].x = -50;
        }
    }

    let x = 10; // X position for the first building
    let ground = height - 50; // ground line position 
    
    // generates buildings for entire width (can change depending on where we want buildings to end)
    while (x < width - 50) {
        let w = random(50, 100); // random width for buildings
        let h = random(100, 250); // random height for buildings
        drawBuilding(x, ground - h, w, h); 
        x += w + 10; // new x position: move to the right and adding spacing btwn buildings
    }
    
    // draw ground line
    line(0, ground, width, ground);
}

function drawBuilding(x, y, w, h) {
    fill(200); // building = grey
    rect(x, y, w, h); // draw rectangle building
    
    // different rooftop styles (can add more later)
    let style = int(random(3)); // randomly picks one of three styles
    if (style === 0) {
        // triangle roof
        triangle(x, y, x + w / 2, y - 20, x + w, y);
    } else if (style === 1) {
        // rectangle roof
        rect(x + w * 0.25, y - 20, w * 0.5, 20);
    } else if (style === 2) {
        // no roof
        line(x, y, x + w, y);
    }
    
    drawWindows(x, y, w, h);
}

function drawWindows(x, y, w, h) {
    let cols = int(random(2, 4)); // random number of window columns
    let rows = int(random(3, 6)); // random number of window rows
    
    let winW = w / cols * 0.6; // window width 
    let winH = h / rows * 0.6; // window height 
    let paddingX = (w - cols * winW) / (cols + 1); // horizontal padding
    let paddingY = (h - rows * winH) / (rows + 1); // vertical padding
    
    fill(255); // window = white
    for (let i = 0; i < cols; i++) { 
        for (let j = 0; j < rows; j++) { 
            let wx = x + paddingX + i * (winW + paddingX); // X position
            let wy = y + paddingY + j * (winH + paddingY); // Y position
            rect(wx, wy, winW, winH); // draw the window
        }
    }
}

function windowResized() {
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
    redraw();
}