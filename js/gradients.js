// import { startRainbow, generateRBWGrad, generateCompGrad } from './rbw-grad.js'

const rainbowValues = [
    "hsla(0, 100%, 50%, ",
    "hsla(30, 100%, 50%, ",
    "hsla(60, 100%, 50%, ",
    "hsla(90, 100%, 50%, ",
    "hsla(120, 100%, 50%, ",
    "hsla(150, 100%, 50%, ",
    "hsla(180, 100%, 50%, ",
    "hsla(210, 100%, 50%, ",
    "hsla(240, 100%, 50%, ",
    "hsla(270, 100%, 50%, ",
    "hsla(300, 100%, 50%, ",
    "hsla(330, 100%, 50%, "
]

let movingRainbow = rainbowValues
let direction = 90
let opacity = 1

// Code for rainbow effect on arrow

export function startRainbow(len, speed, elem, startDir){
    opacity = 1;
    if (startDir || startDir === 0) {
        direction = startDir
    } else {
        direction = Math.floor(Math.random() * 180)
    }

    let timesRun = 0;
    const rainbowCycle = setInterval(function() {
        timesRun += 1;
  
        if(timesRun > len){
            clearInterval(rainbowCycle);
        }
    
        cycleArray(movingRainbow);

        elem.style.background = generateRBWGrad(movingRainbow, (1 / len), speed)
        //return generateRBWGrad(movingRainbow);
    
    }, 20);
}

function generateRBWGrad(arr, fract, step){
    direction += step
    opacity -= fract

    let rainbowStr = "linear-gradient(" + direction + "deg, "

    arr.forEach((element) =>{
        rainbowStr += (element + opacity + "), ")
    })
    rainbowStr = rainbowStr.substring(0, rainbowStr.length - 2);
    rainbowStr += ")";

    return rainbowStr;
}

function cycleArray(arr) {
    arr.push(arr[0]);
    arr.shift();

    return arr;
}

export function generateStripeGrad(reps, color1, color2) {

    const segment = 100 / reps
    let gradStr = "linear-gradient(0deg, "

    for (let i=0; i<reps; i++) {
        let addStr
        
        if (i%2) {
            addStr = color1
        } else {
            addStr = color2
        }

        if (i == 0) {
            addStr = addStr.concat(" " + segment + "%, ")
        } else if (i == reps - 1) {
            addStr = addStr.concat(" " + (segment * i) + "%)")
        } else {
            addStr = addStr + " " + (segment * i) + "%, " + addStr + " " + (segment * (i + 1)) + "%, "
        }

        gradStr = gradStr.concat(addStr)
    }

    //console.log(gradStr)
    return gradStr
}

export function generateCompGrad(arr) {

    const segment = 100 / arr.length

    let gradStr = "linear-gradient(90deg, "
    
    for (let i=0; i<arr.length; i++) {
        let addStr
        
        if (arr[i] == -1) {
            addStr = 'yellow'
        } else if (arr[i] == 0) {
            addStr = 'gray'
        } else if (arr[i] == 1) {
            addStr = 'green'
        }

        if (i == 0) {
            addStr = addStr.concat(" " + segment + "%, ")
        } else if (i == arr.length - 1) {
            addStr = addStr.concat(" " + (segment * i) + "%)")
        } else {
            addStr = addStr + " " + (segment * i) + "%, " + addStr + " " + (segment * (i + 1)) + "%, "
        }

        gradStr = gradStr.concat(addStr)
    }

    //console.log(gradStr)
    return gradStr
}