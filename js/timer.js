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
  
export function startTimer2() {
    timerObj.start = grabTimeInt();

    console.log(timerObj.start, intToStampStr(timerObj.start, [0, 1]))
}

export function stopTimer2() {
    const thisTime = grabTimeInt();

    const timeDiff = thisTime - timerObj.start;
    const diffStamp = intToStampStr(timeDiff, [2, 3]);

    console.log(timeDiff, diffStamp);
    return [timeDiff, diffStamp];
}

export function grabTimeInt() {
    const date = new Date;

    return date.getTime()
}

export function intToTimeArr(int) {
    const day = Math.floor(int / 86400000);
    const hour = Math.floor(int / 3600000) % 24;
    const min = Math.floor(int / 60000) % 60;
    const sec = Math.floor(int / 1000) % 60;
    const mil = int % 1000;
    
    const finalArr = [day, hour, min, sec, mil];
    console.log(int, finalArr);
    timeArrToStampStr(finalArr)
    return finalArr
}

function timeArrToStampStr(arr, rangeArr) {
    let timeStampStr = '';
    let stringStart = false;

    if (rangeArr) {

        for (let i = rangeArr[0]; i <= rangeArr[1]; i++) {
            if ( i == rangeArr[0] ) {
                timeStampStr += arr[i];
            } else {
                timeStampStr += ':';
                timeStampStr += appendZero(arr[i]);
            }
        }

    } else {
        arr.forEach(int => {
            if (int > 0 || stringStart) {
                if (stringStart) {
                    timeStampStr += ':';
                    timeStampStr += appendZero(int);
                } else {
                    stringStart = true;
                    timeStampStr += int;
                }
            }
        })    
    }

    console.log(timeStampStr);
    return timeStampStr;
}

function intToStampStr(int, rangeArr) {
    
    return timeArrToStampStr(intToTimeArr(int), rangeArr)
}
  
function appendZero(n) {
    n = String(n)
    
    if (n.length < 2) {
        return "0" + n
    } else {
        return n
    }
}