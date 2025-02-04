// import { nextTimerMode, startTimer, stopTimer } from './js/timer.js'

let timerBool = false
let timerInterval

let defaultCountdown = 10
export let timerMode = 1
let timerObj = {
    "start": null,
    "target": null,
}

let ding = new Audio("../sound/ding.wav");
ding.volume = 0.3

export function startTimer(elem) {
    // TIMER SETUP
    ding.play();
    
    timerBool = true
    timerObj.start = grabTimeHMS()
    displayTime(elem)
  
    // TIMER INTERVAL LOOP
    timerInterval = setInterval(() => {
        displayTime(elem)
    }, 999)
}

export function stopTimer() {
    timerBool = false
    
    if (timerInterval) {
        clearInterval(timerInterval)
    }
}
  
export function nextTimerMode() {
    if (timerMode < 2) {
        timerMode++
    } else {
        timerMode = 0
    }

    console.log(timerMode)
}

function grabTimeHMS() {
    // TODO: change all functions to relate to Date.now()
    
    const date = new Date;
    // date.setTime(result_from_Date_getTime);
  
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hour    = date.getHours();
  
    const timeStr =   hour % 12 + ":" + 
                appendZero(minutes.toString()) + ":" + 
                appendZero(seconds.toString())
    
    const nowRaw =  timeStampToSec(hour + ":" + 
                appendZero(minutes.toString()) + ":" + 
                appendZero(seconds.toString()))
  
    //console.log(nowRaw)
    //console.log(Date.now())
  
    return nowRaw
}
  
function displayTime(elem) {
    
    let rawSecDifference = grabTimeHMS() - timerObj.start
    let stampLength = 4
    let displayStamp
  
    if (timerMode == 1) {

        if (rawSecDifference >= 36000) {
            stampLength = 8
        } else if (rawSecDifference >= 3600) {
            stampLength = 7
        } else if (rawSecDifference >= 600) {
            stampLength = 5
        }
      
        displayStamp = trimTimeStamp(secToTimeStamp(rawSecDifference)[1], stampLength)

    } else if (timerMode == 2) {

        const miniTimer = defaultCountdown - (rawSecDifference % defaultCountdown)
        
        if (miniTimer == defaultCountdown) {
            ding.play()
        }

        displayStamp = trimTimeStamp(
            secToTimeStamp(miniTimer)[1], 
            String(miniTimer).length
        )
    }
  
    elem.innerText = displayStamp
  
    if (timerBool == false) {
        clearInterval(timerInterval);
    }
}
  
function timeStampToSec(str) {
    const timeStampArr = str.split(':')
  
    let rawSecInt =     Number(timeStampArr[2])
    rawSecInt +=    Number(timeStampArr[1] * 60)
    rawSecInt +=    Number(timeStampArr[0] * 3600)
  
    return rawSecInt
}
  
function secToTimeStamp(int) {
    let timeStampArr = [null, null, null]
  
    const rawSec = int % 60
    const rawMin = (int - rawSec) % 3600
    const rawHour = (int - rawMin - rawSec)
  
    timeStampArr[2] = rawSec
    timeStampArr[1] = rawMin / 60
    timeStampArr[0] = rawHour / 3600
  
    const stampsAndString = [
        timeStampArr, 
        timeStampArr[0] % 12 + ":" + 
        appendZero(timeStampArr[1]) + ":" + 
        appendZero(timeStampArr[2])
    ]
  
    return stampsAndString
}
  
function trimTimeStamp(str, val) {
    return str.substring((str.length - val), str.length)
}
  
function appendZero(n) {
    n = String(n)
    
    if (n.length < 2) {
        return "0" + n
    } else {
        return n
    }
}