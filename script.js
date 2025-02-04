import { shuffle as myShuffle } from './js/shuffle.js'
import {
    targetLang, speechRec, 
    setLanguage, startRecLoop, stopRecLoop
} from './js/speech-rec.js'
import { 
    omitPunctuation, omitWords, 
    parseColon, numToTexts, genWPStrToArr, 
    compareSents, compareWords, queueToArr 
} from './js/word-process.js'
import { synthSpeak } from './js/speech-synth.js'
import { startRainbow, generateStripeGrad, generateCompGrad } from './js/gradients.js'
import { timerMode, nextTimerMode, startTimer, stopTimer } from './js/timer.js'
import { 
    genBlankCompMap, findInt, 
    checkMapForZero, checkMapForInt,
    indexIntsFromMap, trackCompletion 
} from './js/completion-map.js'
import { 
    splitPinyin, addPinTone, charToPin,
    constructPinRT, constructZhuRT 
} from './js/ruby-text.js'

// - - - ELEMENTS - - - //

const userAgent = navigator.userAgent;

// ux elements that show the user whether their setup can successfully run Speak Up!
// currently requires Chromium and mic permissions

const chromeIcon = document.getElementById("chromeIcon");
const mic = document.getElementById("mic");


// ux elements that show user progress through arrow movement, score, timer, and awards

const progBtns        = document.querySelector('#progBtns')
const arrowOverlay    = document.getElementById('rainbowOverlay')
const stopWatch       = document.getElementById('stopWatch')
const awardDiv        = document.getElementById('awardDiv')
const scoreMarker     = document.getElementById('scoreMarker')
const settingsMenu    = document.querySelector('.settings')
const langDisplay     = document.getElementById('langDisplay')
const synthSpeed      = document.getElementById('synthSpeed')
const synthVol        = document.getElementById('synthVol')
const speedReader     = document.getElementById('speedReader')
const volReader       = document.getElementById('volReader')

function synthWrap() {
    stopRecLoop()
    synthSpeak(sentenceArrays[progressMarkers[0]], 1, 1)
    startRecLoop(1, 1, 0)
}

// Assign functions to btns



// elements contained in the setting section

const contentBlocks = document.getElementById("contentBlocks")
const startMenu = document.getElementById("startMenu")
const textInput = document.getElementById("textInput")

// buttons and their fuunctions

const presetBtn     = document.querySelector('#preset')
const shuffleBtn    = document.querySelector('#shuffle')
const timerBtn      = document.querySelector('#timer')
const loopBtn       = document.querySelector('#loop')
const goBtn         = document.querySelector('#goBtn')
const leftBtn       = document.querySelector('#leftBtn')
const playBtn       = document.querySelector('#playBtn')
const homeBtn       = document.querySelector('#homeBtn')
const userBtn       = document.querySelector('#userBtn')
const fullscreenBtn = document.querySelector('#fullscreenBtn')
const qrBtn         = document.querySelector('#qrBtn')
const settingBtn    = document.querySelector('#settingBtn')

presetBtn.addEventListener("click", togglePresets)
shuffleBtn.addEventListener("click", toggleShuffle)
loopBtn.addEventListener("click", toggleLoop)
timerBtn.addEventListener("click", changeTimerMode)
goBtn.addEventListener("click", startQueue)
leftBtn.addEventListener("click", tryLeftRound)
playBtn.addEventListener("click", synthWrap)
homeBtn.addEventListener("click", endQueue)
userBtn.addEventListener("click", showUserPage)
fullscreenBtn.addEventListener("click", toggleFullscreen)
//qrBtn.addEventListener("click", toggleQR)
settingBtn.addEventListener("click", toggleSettings)


const presetOpts = document.getElementById("presetOptions");
const searchTitles = document.getElementById("searchTitles");
const titleCards = document.getElementById("titleCards");
const partsCards = document.getElementById("partsCards");

searchTitles.addEventListener("input", e => {
    const value = e.target.value.toLowerCase()

    searchList = []
    titleList.forEach(title => {
        if (title.toLowerCase().includes(value)){
            searchList.push(title);
        }
    })

    populateBookTitles(searchList);
})

// elements contained in the action section
// action section contains two columns, one for target words and the other for user input

const columnWrap      = document.getElementById("columnWrap");
const targetColumn    = document.querySelector(".targetColumn");
const utterTexts      = document.querySelector(".texts");

const viewQR          = document.getElementById('viewQR')

const userEntry       = document.getElementById('userEntry')
const availableUsers  = document.getElementById('availableUsers')
const userName        = document.getElementById('userName')

// - - - VARIABLES - - - //

// arrays for sentences and subdivisions


let bookIndexArray= []
let targetList    = []

let sentenceArrays = []
let progressMarkers = [0, 0]
let completionMap = []

// index markers for working through the above arrays

let targetCount = 0
let sentenceCount = 0
let bookIndex = 0


// boolean variables that control whether features are on or off
//    presetBool   - false means freeform, true means preset
//    shuffleBool  - false means chronological targets, true means shuffled targets
//    loopBool     - false means finishes after 1 iteration, true means continues iterating until the user stops

let presetBool      = false
let shuffleBool     = false
let loopBool        = false
let fullscreenBool  = false
let isLeftRound     = false

let microphone

// setting for P5 sawtooth frequency

// let defaultFreq = 400




// variables to fill with JSON data using fetch

let bookList;
let titleList = [];

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
        populateBookTitles(titleList);
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

if(userAgent.match(/chrome|chromium|crios/i)){
    chromeIcon.classList.add('flip')
}

function micSuccess() {
    console.log("mic connected");
    mic.classList.add('flip');
}

function micFail(error) {
    console.log(error);
    mic.classList.remove('flip');
}

function checkForMic() {
    navigator.getUserMedia({ audio: true }, micSuccess, micFail);
}

checkForMic()

speechRec.addEventListener("result", (e) => {
  
    const text = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

    const utteredWords = genWPStrToArr(text, targetLang)

    populateUtterances(utteredWords, utterTexts)

    if (e.results[0].isFinal) {
        console.log('Comparing sentences...')

        if (!isLeftRound) {
            const compareArr = trackCompletion(
                sentenceArrays[progressMarkers[0]], 
                utteredWords, 
                'linear', 
                targetLang, 
                progressMarkers[1],
                completionMap[progressMarkers[0]]
            )

            completionMap[progressMarkers[0]] = compareArr[0]
            progressMarkers[1] = compareArr[1]
          
            logProgress(completionMap[progressMarkers[0]], progressMarkers[0])
            evalArr(completionMap[progressMarkers[0]])

        } else {
            const leftArr = grabLeftovers(sentenceArrays, completionMap)

            console.log(leftArr)

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
})

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
        inputWord.classList.add('one-word')
        inputWord.id = 'input' + n
        inputWord.innerText = word

        elem.appendChild(inputWord)
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

      console.log(targetLang)
      
      // clear the index array
      bookIndexArray = [];
      
      // see which boxes are checked
      const checkboxes = document.querySelectorAll('input[type="checkbox"]')

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
      
      const freeformText = textInput.value.replace(/^\s*\n/gm, "");
      sentenceQueue = freeformText.split('\n');
    }
    
    if (shuffleBool) {
        sentenceQueue = myShuffle(sentenceQueue)
    }

    sentenceArrays = queueToArr(sentenceQueue, targetLang)

    const blankCompData = genBlankCompMap(sentenceArrays)

    completionMap = blankCompData[0]
    //let totalWords = blankCompData[1]

    populateProgressParts(blankCompData)
    //document.querySelector('#progBtns').style.background = generateStripeGrad(totalWords, 'yellow', 'blue')

    loadTarget(sentenceArrays[progressMarkers[0]])
    startRecLoop(1, 1, 0, targetLang)
    shiftContentBlocks('game')
}

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
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

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
        const newSpan = document.createElement('span')
        newSpan.setAttribute('id', ('target' + n))
        newSpan.classList = 'one-word target'

        if (!leftoversBool) {

            if (completionMap[progressMarkers[0]][n] == -1) {
                newSpan.classList.add('grayed-out')
            } else if (completionMap[progressMarkers[0]][n] == 1) {
                newSpan.classList.add('correct')
            } else {
                const leftButton = document.createElement('div')
                leftButton.classList.add('leftButton')
                leftButton.innerText = '◀'
                leftButton.addEventListener('click', assignLeftover(n))
                newSpan.appendChild(leftButton)
            }
        }

        const text = arr[n]
        let newContent

        if (targetLang == 'zh') {
            console.log(text)

            // TODO: fix functions so if the dict doesn't have the char,
            // they will just return the char rather than nothing

            newContent = constructPinRT(
                text, charToPin(text), 'under'
            )
        } else {
            newContent = document.createTextNode(text)
        }
        

        newSpan.append(newContent)

        targetColumn.appendChild(newSpan)
    }
}

function updateTargVisual(arr, delay) {
    const allTargs = Array.from(document.getElementsByClassName('target'))

    for (let i = 0; i < arr.length; i++) {
        setTimeout(() => {

            if (arr[i] == 0) {
                allTargs[i].classList = 'one-word target'
                allTargs[i].classList.add('correct')
            } else {
              
                if (allTargs[i].children[0]) {
                    allTargs[i].children[0].remove()
                }

                if (arr[i] == -1) {
                    allTargs[i].classList.add('grayed-out')
                } else if (arr[i] == 1) {
                    allTargs[i].classList.add('correct')
                }
            }
        }, delay * i)
    }
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

function togglePresets() {
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

function toggleTab(classStr) {
  tab = document.querySelector('.'+ classStr)

  if (tab.classList.contains('show')) {
    tab.classList.remove('show')
  } else {
    tab.classList.add('show')
  }
}

function toggleFullscreen() {
  if (fullscreenBool) {
    document.exitFullscreen()
    fullscreenBool = false
  } else {
    document.documentElement.requestFullscreen()
    fullscreenBool = true
  }
}

function populateBookTitles(arr) {
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

        const targElem = targetColumn.children[n]
        targElem.classList.add('grayed-out')

        const sentPart = document.querySelector('#prog' + progressMarkers[0])
        sentPart.style.background = generateCompGrad(completionMap[progressMarkers[0]])
        // sentPart.disabled = true

        leftBtn.classList.add('active')

        event.target.remove()

        if (findInt(completionMap[progressMarkers[0]], 0) < 0) {
            nextSentence()
        }
    }
}

function populateChunks(n) {
      
  const clearHighlight = document.querySelector('.title-highlight')
      
  if(clearHighlight) {
    clearHighlight.classList.remove('title-highlight')
  }

  titleCards.children[n].classList.add('title-highlight')
  
  partsCards.innerHTML = "";

  let x = 0;

  bookList[n].parts.forEach(chunk =>{
    constructPresetCheckbox(chunk, x)
    x++
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
        if (i == 0) {
            progPart.style.borderBottomLeftRadius = '25px'
        }
        progPart.addEventListener('click', jumpToSentence(i))
        progBtns.append(progPart)

        rowTempStr += 100 * arr[i].length / total + "fr "
    }

    console.log(rowTempStr)
    progBtns.style.gridTemplateColumns = rowTempStr
}

function constructPresetCheckbox(arr, n) {

    const currentID = 'part' + n;
    const preview = (n + 1) + " - " + arr.text[0]

    let preset = document.createElement('input')
    preset.type = 'checkbox'
    preset.id = currentID

    let preLabel = document.createElement('label')
    preLabel.htmlFor = currentID
    preLabel.innerText = arr.award + preview

    let divWrap = document.createElement('div')
    divWrap.appendChild(preset)
    divWrap.appendChild(preLabel)

    divWrap.classList.add('one-part')
    divWrap.classList.add('preset-line')

    partsCards.appendChild(divWrap)
}



document.addEventListener('click', function(e) {
  e = e || window.event;
  var target = e.target || e.srcElement,
      text = target.textContent || target.innerText;  
  
  if(target.classList.contains('target')){
    
    word = target.innerText.replace(/◀/g,"")
    synthSpeak(word, 1, 1);

  } 
}, false)

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

// Code for P5 canvas and other P5 functions

function setup() {
    let cnv = createCanvas(100, 100);
    cnv.mousePressed(userStartAudio);

    textAlign(CENTER);
    microphone = new p5.AudioIn();
    microphone.start();

    beep = new p5.Oscillator();
    beep.setType('sawtooth')
}

function draw() {

    micLevel = microphone.getLevel();
    let y = micLevel * height;
    if(y < 1){
        y = 0;
    }

    fill(0, 128, 0)
    noStroke();
    ellipse(width/2, height/2, width, height)

    fill(205, 255, 205);
    stroke(205, 255, 205);
    strokeWeight(height/25);

    arc(width/2, height*3/5, width*.66, min(max(y*5, 0.00001), height*.66), 0, PI);

    noFill();
    arc(width/3, height*2/5, width/10, max(ceil(y/100) * height/10, 0.00001), PI, 0) 
    arc(width*2/3, height*2/5, width/10, max(ceil(y/100) * height/10, 0.00001), PI, 0) 
}

function showUserPage() {
    shiftContentBlocks('user')
}

function shiftContentBlocks(str) {
    if (str == 'user') {
        contentBlocks.style.left = "-200%"
    } else if (str == 'game') {
        contentBlocks.style.left = "-100%"
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
    if (settingsMenu.classList.contains('show')) {
        settingsMenu.classList.remove('show')
    } else {
        settingsMenu.classList.add('show')
    }
}