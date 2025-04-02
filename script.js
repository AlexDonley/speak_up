import { shuffle as myShuffle } from './js/shuffle.js'
import {
    targetLang, speechRec, 
    setLanguage, startRecLoop, stopRecLoop
} from './js/speech-rec.js'
import { 
    genWPStrToArr, compareSents, 
    compareWords, queueToArr 
} from './js/word-process.js'
import { synthSpeak } from './js/speech-synth.js'
import { startRainbow, generateStripeGrad, generateCompGrad } from './js/gradients.js'
import { timerMode, nextTimerMode, startTimer, stopTimer } from './js/timer.js'
import { 
    genBlankCompMap, findInt, 
    checkMapForZero, checkMapForInt,
    indexIntsFromMap, trackCompletion,
    mapToFreqs, findPercent 
} from './js/completion-map.js'
import { 
    monocharLangs, splitPinyin, addPinTone, 
    charToPin, pinToZhu,
    constructPinRT, constructZhuRT 
} from './js/ruby-text.js'
import { oscBeep, createChord } from './js/oscillate.js'
import { urlConfigs } from './js/url-query.js'
import { cycleQRWrap, toggleShowQR, genQRstr, genNewQR } from './js/qr.js'

// - - - ELEMENTS - - - //
// ux elements that show user progress through arrow movement, score, timer, and awards

const progBtns        = document.querySelector('#progBtns');
const stopWatch       = document.querySelector('#stopWatch');
const awardDiv        = document.querySelector('#awardDiv');
const scoreMarker     = document.querySelector('#scoreMarker');
const settingsMenu    = document.querySelector('.settings-menu');
const ffLang          = document.querySelector('#ffLang');
const micBtn          = document.querySelector('#micBtn');
const synthSpeed      = document.querySelector('#synthSpeed');
const synthVol        = document.querySelector('#synthVol');
const speedReader     = document.querySelector('#speedReader');
const volReader       = document.querySelector('#volReader');
const greenArrow      = document.querySelector('#greenArrow');
const arrowPerc       = document.querySelector('#arrowPerc');
const viewQR          = document.querySelector('.view-QR');
const qrImg           = document.querySelector('#qrImg');
const showQR          = document.querySelector('.show-QR-btn');
const genQR           = document.querySelector('.gen-QR-btn');
const goOpt           = document.querySelector('#goOpt');

// elements contained in the setting section

const contentBlocks = document.getElementById("contentBlocks");
const startMenu = document.getElementById("startMenu");
const textInput = document.getElementById("textInput");

// buttons and their fuunctions

const presetBtn     = document.querySelector('#preset');
const shuffleBtn    = document.querySelector('#shuffle');
const timerBtn      = document.querySelector('#timer');
const loopBtn       = document.querySelector('#loop');
const goBtn         = document.querySelector('#goBtn');
const leftBtn       = document.querySelector('#leftBtn');
const playBtn       = document.querySelector('#playBtn');
const homeBtn       = document.querySelector('#homeBtn');
const userBtn       = document.querySelector('#userBtn');
const fullscreenBtn = document.querySelector('#fullscreenBtn');
const settingBtn    = document.querySelector('#settingBtn');

const presetOpts        = document.querySelector("#presetOptions");
const searchTitles      = document.querySelector("#searchTitles");
const titleCards        = document.querySelector("#titleCards");
const partsCards        = document.querySelector("#partsCards");
const pinyinDropdown    = document.querySelector('#pinyinDropdown');

const targetColumn    = document.querySelector(".targetColumn");
const utterTexts      = document.querySelector(".texts");
const userEntry       = document.querySelector('#userEntry');
const availableUsers  = document.querySelector('#availableUsers');
const userName        = document.querySelector('#userName');
const punchBtn        = document.querySelector('.punch-btn');

presetBtn.addEventListener("click", togglePresets);
shuffleBtn.addEventListener("click", toggleShuffle);
loopBtn.addEventListener("click", toggleLoop);
timerBtn.addEventListener("click", changeTimerMode);
goBtn.addEventListener("click", startQueue);
leftBtn.addEventListener("click", tryLeftRound);
playBtn.addEventListener("click", synthSpeakClosure('fullSent', targetLang));
homeBtn.addEventListener("click", endQueue);
userBtn.addEventListener("click", showUserPage);
fullscreenBtn.addEventListener("click", toggleFullscreen);
settingBtn.addEventListener("click", toggleSettings);
pinyinDropdown.addEventListener("change", togglePinyinRT);
synthSpeed.addEventListener("pointermove", updateSpeed);
synthVol.addEventListener("pointermove", updateVol);
viewQR.addEventListener("click", cycleQRWrap);
showQR.addEventListener("click", toggleShowQR);
genQR.addEventListener("click", QRgenWrap);
punchBtn.addEventListener("click", checkAndClear);

// - - - VARIABLES - - - //

// arrays for sentences and subdivisions

let bookIndexArray= []
let bookIndex = 0 

let sentenceArrays = []
let progressMarkers = [0, 0]
let completionMap = []

// index markers for working through the above arrays

let presetBool      = false // false means freeform, true means preset
let shuffleBool     = false // false means chronological targets, true means shuffled targets
let loopBool        = false // false means finishes after 1 iteration, true means continues iterating until the user stops
let fullscreenBool  = false //
let isLeftRound     = false //
let isRecog         = false //

// setting for P5 sawtooth frequency

let defaultFreq = 100

// variables to fill with JSON data using fetch

let bookList;
let titleList = [];
let utteredWords = [];


function QRgenWrap() {
    const newURL = genQRstr(QRdictFromElem());
    genNewQR(newURL, qrImg);
}

function QRdictFromElem() {
    let thisDict = {};

    const chunkIdx = document.querySelectorAll('.preset-check:checked')
    if (presetBool && chunkIdx.length > 0) {
        let thisIdx = bookIndex + "_";

        for (let n = 0; n < chunkIdx.length; n++){
            thisIdx += chunkIdx[n].id.substring(4);

            if(n < chunkIdx.length - 1) {
                thisIdx += "-"
            }
        }

        thisDict.psidx = thisIdx;
    }

    if (goOpt.checked) {
        thisDict.go = true;
    }

    console.log(thisDict);
    return thisDict;
}

function togglePinyinRT() {
    console.log('change')
    const pinRT = Array.from(document.querySelectorAll('.pin-text'));

    pinRT.forEach(element => {
        if (pinyinDropdown.value == 'pinyin') {
            element.classList.remove('hide')
        } else {
            element.classList.add('hide')
        }
    })
}

searchTitles.addEventListener("input", e => {
    const value = e.target.value.toLowerCase()

    let searchList = []
    titleList.forEach(title => {
        if (title.toLowerCase().includes(value)){
            searchList.push(title);
        }
    })

    populatePresets(searchList);
})

// elements contained in the action section
// reading section contains two columns, one for target words and the other for user input

function loadBooks(){
    fetch('./data/books.json')
    .then(res => {
        if (res.ok) {
            console.log('Fetched books');
        } else {
            console.log('Couldnt fetch books')
        }
        return res.json()
    })
    .then(data => {
        bookList = data;

        for (var key in data) {
            titleList.push(data[key].title);
        }
        populatePresets(titleList);
        processQueries();
    })
    .catch(error => console.log(error))
}

loadBooks();

// sound effects

let next    = new Audio("sound/chaching.webm");
let perfect = new Audio("sound/wow.mp3");

// variables for scoring and progress

let score = 0
scoreMarker.innerText = score

//const safariBool = window.navigator.userAgent.includes('Safari');
const safariBool = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
console.log(safariBool)

speechRec.addEventListener("result", (e) => {
  
    const text = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

    utteredWords = genWPStrToArr(text, targetLang)

    populateUtterances(utteredWords, utterTexts)

    if (e.results[0].isFinal) {
        checkAnswer()
    }
})

function checkAnswer() {
    if (!isLeftRound) {
        const compareArr = trackCompletion(
            sentenceArrays[progressMarkers[0]], 
            utteredWords, 
            'linear', 
            targetLang, 
            progressMarkers[1],
            completionMap[progressMarkers[0]]
        )

        updateScore(compareArr[1] - progressMarkers[1])
        completionMap[progressMarkers[0]] = compareArr[0]
        progressMarkers[1] = compareArr[1]
      
        logProgress(completionMap[progressMarkers[0]], progressMarkers[0])
        evalArr(completionMap[progressMarkers[0]])

    } else {
        const leftArr = grabLeftovers(sentenceArrays, completionMap)
        // console.log(leftArr)

        if (leftArr.length > 0) {
            loadTarget(leftArr, true)

            const leftsCompare = trackCompletion(
                leftArr,
                utteredWords,
                'linear',
                targetLang
            )

            leftsCompare[0].forEach(val => {
                if (val == 1) {
                    const coords = checkMapForInt(completionMap, -1)

                    completionMap[coords[0]][coords[1]] = 1

                    const grabProg = document.querySelector('#prog' + coords[0])
                    grabProg.style.background = generateCompGrad(completionMap[coords[0]])

                    updateScore(1)
                }
            })

            updateTargVisual(leftsCompare[0], 50)
            console.log(completionMap)

            setTimeout(() => {

                const newArr = grabLeftovers(sentenceArrays, completionMap)
                
                if (newArr.length > 0) {
                    loadTarget(newArr, true)
                } else {
                   nextSentence()
                }                    

            }, leftsCompare[0].length * 50 + 500)
        }
    }
}

function checkAndClear() {
    checkAnswer();
    utterTexts.innerHTML = '';
}

function tryLeftRound() {
    const coord = checkMapForInt(completionMap, -1)

    if (coord) {

        isLeftRound = true

        const leftArr = grabLeftovers(sentenceArrays, completionMap)
        loadTarget(leftArr, true)
        console.log(leftArr)

    } else {

        isLeftRound = false
        return false

    }
}

function logProgress(arr, sentInd) {

    completionMap[sentInd] = arr
    console.log(completionMap)

    const grabProg = document.querySelector('#prog' + sentInd)
    grabProg.style.background = generateCompGrad(completionMap[sentInd])

    updateTargVisual(arr, 50)
}

function populateUtterances(arr, elem) {
    elem.innerHTML = ""

    let n = 0
    arr.forEach((word) => {
        let inputWord = document.createElement('span')
        inputWord.classList = 'one-word'
        inputWord.id = 'input' + n

        if (monocharLangs.includes(targetLang)) {
            const thisPin = charToPin(word)
            let pinWithTone = ''

            if (thisPin) {
                pinWithTone = addPinTone(splitPinyin(thisPin))
            }

            const newContent = constructPinRT(
                word, pinWithTone, 'under'
            )

            if ( ! (pinyinDropdown.value == 'pinyin') ) {
                newContent.children[0].children[0].classList.add('hide')
            }

            inputWord.append(newContent)
        } else {
            inputWord.innerText = word
        }

        const wrapElem = document.createElement('div')
        wrapElem.classList = 'word-wrap'
        wrapElem.append(inputWord)
        elem.appendChild(wrapElem)
        n++;
    })
}

function evalArr(arr) {
    if (!arr.includes(0)) {
        const delayNext = setTimeout(() => {
            nextSentence()
        }, 50 * arr.length + 500)

        return true
    } else {
        return false
    }
}

function startQueue() {
    
    // clear sentence queue
    let sentenceQueue = []
    sentenceArrays = []
    progressMarkers = [0, 0]

    defaultFreq = 100

    if (!timerMode == 0) {
        startTimer(stopWatch)
    }
  
    // check if the sentence queue will be preset or freeform

    if (presetBool) {
      // PRESET INPUT
      // set the target language

      if (bookList[bookIndex].lang != undefined) {
        setLanguage(bookList[bookIndex].lang)
      } else {
        setLanguage('en')
      }
      
      // clear the index array
      bookIndexArray = [];
      
      // see which boxes are checked
      const checkboxes = document.querySelectorAll('.preset-check')

      for (let n = 0; n < checkboxes.length; n++){
        if (checkboxes[n].checked) {
            bookIndexArray.push(n);
        }
      }

      console.log(bookIndexArray)

      bookIndexArray.forEach((num) => {
          sentenceQueue = sentenceQueue.concat(bookList[bookIndex].parts[num].text)
      })

    } else {
        // FREEFORM INPUT
        // The following grabs the text entered by the user and eliminates blank lines
        setLanguage(ffLang.value)

        const freeformText = textInput.value.replace(/^\s*\n/gm, "");
        sentenceQueue = freeformText.split('\n');
    }
    
    if (shuffleBool) {
        sentenceQueue = myShuffle(sentenceQueue)
    }

    sentenceArrays = queueToArr(sentenceQueue, targetLang)

    const blankCompData = genBlankCompMap(sentenceArrays)

    completionMap = blankCompData[0]
    updateArrow(completionMap)

    populateProgressParts(blankCompData)
    //document.querySelector('#progBtns').style.background = generateStripeGrad(totalWords, 'yellow', 'blue')

    loadTarget(sentenceArrays[progressMarkers[0]])

    toggRecogAndElem(true)

    shiftContentBlocks('game')
}

function toggRecogAndElem(bool) {
    
    let recogSet = isRecog;

    if(bool === true || bool === false) {
        recogSet = !bool;
    }

    if (!recogSet) {
        isRecog = true;
        micBtn.classList.add('active');
        startRecLoop(1, 1, 0, targetLang);
    } else {
        isRecog = false;
        micBtn.classList.remove('active');
        stopRecLoop();
    }
}

micBtn.addEventListener('click', toggRecogAndElem)

function nextSentence() {
  
    // defaultFreq = Math.floor(Math.random() * 400) + 100

    const indexIncomp = checkMapForZero(completionMap)

    if (indexIncomp) {
      
        progressMarkers = indexIncomp
        loadTarget(sentenceArrays[indexIncomp[0]])

    } else {

        const leftoversCheck = checkMapForInt(completionMap, -1) 
        
        if (leftoversCheck) {

            loadTarget(grabLeftovers(sentenceArrays, completionMap), true)
            isLeftRound = true

        } else {

            bookIndexArray.forEach(num => {
                addOneAward(bookIndex, num)
            })       
          
            if(loopBool) {
              startQueue();
            } else {
              endQueue();
            }
        }
    }
}

function endQueue() {
    
    isLeftRound = false

    shiftContentBlocks('menu')

    stopRecLoop()
    stopTimer()

    // uncheck all boxes
    const checkboxes = partsCards.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(box => {
      box.checked = false
    })

    setTimeout(() => {
        targetColumn.innerHTML = ''
        utterTexts.innerHTML = ''
        progBtns.innerHTML = ''
    }, 275)
}

function loadTarget(arr, leftoversBool){
    targetColumn.innerHTML = '';
    // utterTexts.innerHTML = '';

    for (let n = 0; n < arr.length; n++){

        const targWrap = document.createElement('div')
        targWrap.classList.add('word-wrap')

        const newSpan = document.createElement('span')
        newSpan.id = 'target' + n
        newSpan.classList = 'one-word target'

        if (!leftoversBool) {

            if (completionMap[progressMarkers[0]][n] == -1) {
                newSpan.classList.add('grayed-out')
            } else if (completionMap[progressMarkers[0]][n] == 1) {
                newSpan.classList.add('correct')
            } else {
                const leftButton = document.createElement('div')
                leftButton.classList.add('skip-btn')
                leftButton.id = "skip" + n

                const miniTri = document.createElement('div')
                miniTri.classList.add('mini-tri')

                leftButton.append(miniTri)
                leftButton.addEventListener('click', assignLeftover(n))
                targWrap.appendChild(leftButton)
            }
        }

        const text = arr[n]
        let newContent

        if (monocharLangs.includes(targetLang)) {

            const thisPin = charToPin(text)
            let pinWithTone = ''

            if (thisPin) {
                pinWithTone = addPinTone(splitPinyin(thisPin))
            }

            newContent = constructPinRT(
                text, pinWithTone, 'under'
            )

            if ( ! (pinyinDropdown.value == 'pinyin') ) {
                newContent.children[0].children[0].classList.add('hide')
            }

        } else {
            newContent = document.createTextNode(text)
        }
        
        newSpan.append(newContent)
        newSpan.addEventListener('click', synthSpeakClosure(
            text, targetLang
        ))

        targWrap.append(newSpan)
        targetColumn.appendChild(targWrap)
    }
}

function updateTargVisual(arr, delay) {
    
    // update arrow size

    updateArrow(completionMap)
    
    // highlight correct words

    const allTargs = Array.from(document.getElementsByClassName('target'))

    for (let i = 0; i < arr.length; i++) {
        setTimeout(() => {

            if (arr[i] == 0) {

                allTargs[i].classList = 'one-word target'

            } else {

                const skipBtn = document.querySelector('#skip' + i)
                
                if (skipBtn) {
                    skipBtn.classList.add('no-width')
                    
                    //skipBtn.remove()
                }

                if (arr[i] == -1) {
                    allTargs[i].classList.add('grayed-out')
                } else if (arr[i] == 1) {

                    if (!allTargs[i].classList.contains('correct')) {
                        allTargs[i].classList.add('correct')
                        inchUpSound(30)
                    }
                }
            }
        }, delay * i)
    }
}

function updateArrow(map) {

    const freqsNow = mapToFreqs(map)
    const percentNow = findPercent(freqsNow[0][1], freqsNow[1])
    const heightStr = 
        "calc(" + 
        (percentNow) +
        "% + " + 
        (.6 * (100 - percentNow)) +
        "px)"

    greenArrow.style.height = heightStr

    arrowPerc.innerText = Math.round(percentNow, 1) + "%"
}

function grabLeftovers(sentArr, compArr) {

    let leftoversList = []
    
    for (let n = 0; n < compArr.length; n++) {
        for (let m = 0; m < compArr[n].length; m++) {
          if (compArr[n][m] == -1) {
            leftoversList.push(sentArr[n][m])
            }
        }
    }

    return leftoversList
}

function updateScore(n) {
    score += n
    scoreMarker.innerText = score

    if(!(currentUserIndex == null)) {
        userInfo[currentUserIndex].user_score = score
        saveUserDataLocally()
    }
}

function addOneAward(textN, awardN) {
  const thisAward = bookList[textN].parts[awardN].award
  
  awardDiv.prepend(thisAward)

  if (!(currentUserIndex == null)) {
    
    const timeStamp = new Date.now()

    const awardArray = [thisAward, timeStamp]

    userInfo[currentUserIndex].user_awards.push(awardArray)
    console.log(userInfo)
    saveUserDataLocally()
  }
}

function togglePresets(str) {

    if (str == 'preset') {
        presetBool = false
    } else if (str == 'freeform') {
        presetBool = true
    }

    if (presetBool) {

        presetBtn.innerHTML = 'Preset'
        presetBool = false;
        textInput.classList.remove('disappear');

    } else {
    
        presetBtn.innerHTML = 'Freeform'
        presetBool = true;
        textInput.classList.add('disappear');

    }
}

function toggleShuffle() {
  if (shuffleBool) {
    shuffleBool = false;
    shuffleBtn.classList.remove('flip');
  } else {
    shuffleBool = true
    shuffleBtn.classList.add('flip');
  }
}

function toggleLoop() {
  if (loopBool) {
    loopBool = false;
    loopBtn.classList.remove('flip');
  } else {
    loopBool = true
    loopBtn.classList.add('flip');
  }
}

function changeTimerMode() {
  
    nextTimerMode()

    if (timerMode == 0) {

        timerBtn.classList.remove('flip')
      
        timerBtn.children[0].style.clipPath = 
        "polygon(0% 0%, 33% 0%, 50% 20%, 66% 0%, 100% 0%, 100% 33%, 80% 50%, 100% 66%, 100% 100%, 66% 100%, 50% 80%, 33% 100%, 0% 100%, 0% 66%, 20% 50%, 0% 33%)"

    } else {
        timerBtn.classList.add('flip')

        if (timerMode == 1) {
            timerBtn.children[0].style.clipPath = 
            "polygon(0% 33%, 50% 0%, 100% 33%, 80% 33%, 80% 100%, 20% 100%, 20% 33%)"
        } else {
            timerBtn.children[0].style.clipPath = 
            "polygon(20% 0%, 20% 66%, 0% 66%, 50% 100%, 100% 66%, 80% 66%, 80% 0%)"
        }
    }
}

function toggleFullscreen(bool) {
    if (bool) {
        fullscreenBool != bool
    }
    
    if (fullscreenBool) {
        document.exitFullscreen()
        fullscreenBool = false
    } else {
        document.documentElement.requestFullscreen()
        fullscreenBool = true
    }
}

function populatePresets(arr) {
    titleCards.innerHTML = ""

    let n = 0
    arr.forEach((element) => {
        const newTitle = document.createElement('div')
        newTitle.innerText = element

        newTitle.classList.add('preset-line')
        newTitle.classList.add('one-title')

        newTitle.addEventListener('click', selectTitleWrap(n))
        titleCards.appendChild(newTitle)

        n++
    });
}

function selectTitleWrap(n) {
    return function executeOnEvent (event) {
        // console.log(n)
        bookIndex = n
        populateChunks(n)    
    }
}

function jumpToSentence(n) {
    return function executeOnEvent (event) {
        isLeftRound = false
      
        progressMarkers[0] = n
        progressMarkers[1] = 0
        loadTarget(sentenceArrays[progressMarkers[0]])
    }
}

function assignLeftover(n) {
    return function executeOnEvent (event) {
      
        completionMap[progressMarkers[0]][n] = -1
        console.log(completionMap)

        const targElem = document.querySelector('#target' + n)
        targElem.classList.add('grayed-out')

        const sentPart = document.querySelector('#prog' + progressMarkers[0])
        sentPart.style.background = generateCompGrad(completionMap[progressMarkers[0]])
        // sentPart.disabled = true

        leftBtn.classList.add('active')

        const thisSkip = document.querySelector('#skip' + n)
        thisSkip.classList.add('no-width')
        //event.target.remove()

        if (findInt(completionMap[progressMarkers[0]], 0) < 0) {
            nextSentence()
        }
    }
}

function synthSpeakClosure(str, lang) {
    
    return function executeOnEvent(event) {
        toggRecogAndElem(false)
        
        let thisSent = str
        
        if (str == 'fullSent') {
            thisSent = sentenceArrays[progressMarkers[0]].join(' ')
        } 
        
        synthSpeak(thisSent, synthSpeed.value, synthVol.value, lang, micBtn)
    }
}

function populateChunks(n) {
      
    const clearHighlight = document.querySelector('.title-highlight')

    if(clearHighlight) {
        clearHighlight.classList.remove('title-highlight')
    }

    titleCards.children[n].classList.add('title-highlight')

    partsCards.innerHTML = "";

    let m = 0;

    bookList[n].parts.forEach(chunk =>{
        constructPresetCheckbox(chunk, m)
        m++
    })
}

function populateProgressParts([arr, total]) {

    let rowTempStr = ''
    progBtns.innerHTML = ''

    for (let i = 0; i < arr.length; i++) {
        const progPart = document.createElement('div')
        progPart.classList.add('prog')
        progPart.id = 'prog' + i
        
        progPart.style.background = "gray"
        progPart.addEventListener('click', jumpToSentence(i))
        progBtns.append(progPart)

        rowTempStr += 100 * arr[i].length / total + "fr "
    }

    progBtns.style.gridTemplateColumns = rowTempStr
}

function constructPresetCheckbox(arr, n) {

    const currentID = 'part' + n;
    const preview = (n + 1) + " - " + arr.text[0]

    let preset = document.createElement('input')
    preset.classList.add('preset-check')
    preset.type = 'checkbox'
    preset.id = currentID

    let preLabel = document.createElement('label')
    preLabel.classList.add('preset-label')
    preLabel.htmlFor = currentID
    preLabel.innerText = arr.award + preview

    let divWrap = document.createElement('div')
    divWrap.appendChild(preset)
    divWrap.appendChild(preLabel)

    divWrap.classList.add('one-part')
    divWrap.classList.add('preset-line')

    partsCards.appendChild(divWrap)
}

function updateSpeed() {
  speedReader.innerText = synthSpeed.value
}

function updateVol() {
  volReader.innerText = synthVol.value
}

// function populateVoices(arr) {
//   for (let n = 0; n < arr.length; n++) {
//     const newOpt = document.createElement('option')
//     newOpt.value = n
//     newOpt.innerText = arr[n].name

//     voiceSelect.append(newOpt)
//   }
// }

function showUserPage() {
    shiftContentBlocks('user');
    stopRecLoop();
}

function shiftContentBlocks(str) {
    playBtn.disabled = true;
    micBtn.disabled = true;
    
    if (str == 'user') {
        contentBlocks.style.left = "-200%"
    } else if (str == 'game') {
        contentBlocks.style.left = "-100%"
        playBtn.disabled = false;
        micBtn.disabled = false;
    } else if (str == 'menu') {
        contentBlocks.style.left = "0%"
    }
}

let currentUser = null
let currentUserIndex = null
let userInfo = []
if (localStorage.getItem("user_info")) {
    userInfo = JSON.parse(localStorage.getItem("user_info"))
}
populateUserButtons()

function createUser() {
    inputName = userEntry.value

    // check variable to see if entered name already exists

    overwriteCheck = true
    userInfo.forEach(entry => {
        if (entry.user_name == inputName) {
            overwriteCheck = confirm("This name already exists. Would you like to overwrite? Doing so will erase all existing information on the user")
        }
    })

    // append new user info
    // this code is bad, come back and fix it
    if (overwriteCheck) {
        userInfo.push({
            "user_name": inputName, 
            "user_score": 0, 
            "user_awards": [], 
            "user_completions": []
        })

        saveUserDataLocally()
        populateUserButtons()
    }
}

function saveUserDataLocally() {
    userDataString = JSON.stringify(userInfo)
    localStorage.setItem("user_info", userDataString)
}

function populateUserButtons() {
    availableUsers.innerHTML = ''

    userInfo.forEach(entry => {
        const newButton = document.createElement('button')
        newButton.innerText = entry.user_name
        newButton.classList.add('name-btn')
        newButton.setAttribute('onclick', 'setUser("' + entry.user_name + '")')
      
        availableUsers.append(newButton)
    })
}

function setUser(str) {
    currentUser = str
    userName.innerText = str
    userName.classList.add('show')

    currentUserIndex = userInfo.findIndex(entry => entry.user_name == str)
    console.log(currentUserIndex)

    score = 0

    reloadAwards(currentUserIndex)
}

function reloadAwards(index) {
    console.log('reconstruct Awards functions')

    //checkLength = userInfo[index].user_awards.length
}

function toggleSettings() {

    createChord(null, 1, 30)
    if (settingsMenu.classList.contains('show')) {
        settingsMenu.classList.remove('show')
    } else {
        settingsMenu.classList.add('show')
    }
}

function inchUpSound(n) {
    oscBeep(defaultFreq, 0.01, 0.3, 'square')
    defaultFreq += n
}

console.log(urlConfigs)

function processQueries(data) {
    const fullWordlist = data

    if (urlConfigs) {
        if (urlConfigs.fs == 'true') {
            createFSInteractor()
        }
        
        if (urlConfigs.psidx) {
            const splitOne = urlConfigs.psidx.split('_');
            const bookIdx = splitOne[0];
            const splitTwo = splitOne[1].split('-');
            
            togglePresets('preset')

            bookIndex = bookIdx;
            populateChunks(bookIdx);
            const allChecks = partsCards.querySelectorAll('input[type="checkbox"]');

            splitTwo.forEach(val => {
                if (allChecks[val]) {
                    allChecks[val].checked = true;
                }
            })
        }
    
        if (urlConfigs.go == 'true') {
            startQueue()
        }
    }
}

function createFSInteractor() {
    const FSdiv = document.createElement('div');
    FSdiv.classList.add('fullscreen-interaction');
    FSdiv.innerText = 'click to continue';
    FSdiv.addEventListener('click', FSwrapper(true))

    document.body.append(FSdiv);
}

function FSwrapper(bool) {
    return function executeOnEvent(e) {
        toggleFullscreen(bool);
        e.target.remove()
    }
}
