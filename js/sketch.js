// sketch.js 

let canvasContainer;
let color = 0;

let sliders = [];
let sliderValues = [];

let count = 0;
let xLightning1 = 0;
let xLightning2 = 0;
let yLightning1 = 0;
let yLightning2 = 0;

let strikeThreshold = 95;

let buildings = []; //array for buildings 
let ground;

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
            console.log("Slider " + (i + 1) + " value: " + sliderValues[i]);
        }
    }
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");

    setupSliders();

    ground = height - 50; // ground line position
    generateBuildings(); // generate buildings only once at startup
    
    //noLoop(); 
}

function generateBuildings() {
    buildings = []; //clear any existing buildings
    let x = 10; // X position for the first building
    
    // generates buildings for entire width
    while (x < width - 50) {
        let w = random(50, 100); // random width for buildings
        let h = random(100, 250); // random height for buildings
        let roofStyle = int(random(3)); // random roof style
        
        //store building data
        buildings.push({
            x: x,
            y: ground - h,
            w: w,
            h: h,
            roofStyle: roofStyle,
            cols: int(random(2, 4)),
            rows: int(random(3, 6))
        });
        
        x += w + 10; // new x position: move to the right and adding spacing btwn buildings
    }
}


function draw() {
    clear();
    if (strikeChance() > strikeThreshold)
        lightningFlash();
    else
        background(0);
    stroke(0); // building outline = black
    strokeWeight(3);

    // let x = 10; // X position for the first building
    // let ground = height - 50; // ground line position 
    
    // // generates buildings for entire width (can change depending on where we want buildings to end)
    // while (x < width - 50) {
    //     let w = random(50, 100); // random width for buildings
    //     let h = random(100, 250); // random height for buildings
    //     drawBuilding(x, ground - h, w, h); 
    //     x += w + 10; // new x position: move to the right and adding spacing btwn buildings
    // }
    
    // draw all buildings from the array
    for (let building of buildings) {
        drawBuilding(
            building.x, 
            building.y, 
            building.w, 
            building.h, 
            building.roofStyle,
            building.cols,
            building.rows
        );
    }
    
    // draw ground line
    line(0, ground, width, ground);
}

function drawBuilding(x, y, w, h, roofStyle, cols, rows) {
    fill(200); // building = grey
    rect(x, y, w, h); // draw rectangle building
    
    // different rooftop styles (can add more later)
    if (roofStyle === 0) {
        // triangle roof
        triangle(x, y, x + w / 2, y - 20, x + w, y);
    } else if (roofStyle === 1) {
        // rectangle roof
        rect(x + w * 0.25, y - 20, w * 0.5, 20);
    } else if (roofStyle === 2) {
        // no roof
        line(x, y, x + w, y);
    }
    
    drawWindows(x, y, w, h, cols, rows);
}

function drawWindows(x, y, w, h, cols, rows) {
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
    // redraw();
    ground = height - 50; // update ground position
    generateBuildings(); // rgenerate buildings when window resized
}

function mousePressed() {
    console.log(strikeChance());
}

function strikeChance() {
    let workWeight = int(random(0, sliderValues[0])) / 2;
    let sleepWeight = int(random(100 - sliderValues[1], 100)) / 2;
    return workWeight + sleepWeight;
}

function lightningFlash() {
    background(100);
    xLightning2 = int(random(0, width));
    yLightning2 = 0;

    stroke(255, 255, random(0, 255));
    for (let i = 0; i < 50; i++) {
        xLightning1 = xLightning2;
        yLightning1 = yLightning2;
        xLightning2 += int(random(-20, 20));
        yLightning2 += int(random(5, 20));
        line(xLightning1, yLightning1, xLightning2, yLightning2);
    }
}