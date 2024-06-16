const userAgent = navigator.userAgent;
const texts = document.querySelector(".texts");
const targetColumn = document.querySelector(".targetColumn");
const title = document.querySelector("h1");
const progressParts = Array.from(document.getElementsByClassName('bar-part'));

const chromeIcon = document.getElementById("chromeIcon");
const mic = document.getElementById("mic");
const columnWrap = document.getElementById("columnWrap");
const startMenu = document.getElementById("startMenu");
const textInput = document.getElementById("textInput");
const presetBtn = document.getElementById("preset");
const shuffleBtn = document.getElementById("shuffle");
const timerBtn = document.getElementById("timer")
const loopBtn = document.getElementById("loop");
const presetOpts = document.getElementById("presetOptions");
const stopwatch = document.getElementById("stopwatch");
const currentAwards = document.getElementById("currentAwards");
const previousAwards = document.getElementById("previousAwards");
const scoreMarker = document.getElementById("scoreMarker");

sentenceQueue = [];
divided = [];
indexArray = [];
leftoversList = [];
targetList = [];
targetCount = 0;
inputCount = 0;
listenBool = false;
presetBool = false;
shuffleBool = false;
loopBool = false;
timerBool = false;

defaultCountdown = 10;
timerSetting = 1;
timerInnerTexts = [
  '<div class="behind">&#10006;</div><ion-icon name="timer-outline"></ion-icon>',
  '&#9650;<br><ion-icon name="timer-outline"></ion-icon>',
  '<ion-icon name="timer-outline"></ion-icon><br>&#9660;'
]

let bookList;
let titleList = [];
let homophones;

let next = new Audio("sound/chaching.webm");
let perfect = new Audio("sound/wow.mp3");
let spokenSentence; 
let score = 0;

// order for progress bar data will be incomplete, leftover, complete
progress = [0, 0, 0];
totalWordsToRead = 0;
updateProgressBar(progress);

scoreMarker.innerText = score;
sentenceCount = 0;

onesDigits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
tweenDigits = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
tensDigits = ['zero', 'teen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
cutOut = ["ah", "ahh", "mm", "mmm", "hm", "hmm", "mhm", "uh", "ah", "huh", "eh", "sh", "shh"]



if(userAgent.match(/chrome|chromium|crios/i)){
  chromeIcon.classList.add('flip')
}

function micSuccess() {
  console.log("mic connected");
  mic.classList.add('flip');
}

function micFail(error) {
  console.log(error);

  if (error === 'NO_DEVICES_FOUND') {
     // NO_DEVICES_FOUND (no microphone or microphone disabled)
  }

}

navigator.getUserMedia({ audio: true }, micSuccess, micFail);

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'en'

recognition.addEventListener("result", (e) => {
  
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  //console.log(e.results)

  wordlist = omitPunctuation(text).toLowerCase().split(' ');

  //console.log(wordlist)

  texts.innerHTML = ""
  n = 0

  convertNumsToText(wordlist);

  wordlist.forEach((element) => {
    let inputWord = document.createElement('span');
    inputWord.setAttribute('id', ('input' + n));
    inputWord.innerText = element;
    texts.appendChild(inputWord);
    n++;
  })

  // inputWord.innerText = text;

  if (e.results[0].isFinal) {
    console.log('checking sentence');
    checkSentence(wordlist);
  }
});

recognition.addEventListener("end", () => {
  if(listenBool){
    recognition.start();
  }
});

function startRound() {
    // clear sentence queue
    sentenceQueue = [];
    leftoversList = [];

    totalWordsToRead = 0;
    progress = [0, 0, 0];
    

    if(!timerBool & timerSetting > 0){
      timerBool = true;
      
      if (timerSetting == 1) {
        startTimer(0)
      } else if (timerSetting ==2) {
        startTimer(defaultCountdown);
      }
    }
  
    // check if the sentence queue will be preset or freeform

    if (presetBool) {
      // see which boxes are checked

      checkboxes = document.querySelectorAll('input');

      indexArray = [];

      for (let n = 0; n < checkboxes.length; n++){
        if (checkboxes[n].checked) {
            indexArray.push(n);
        }
      }

      indexArray.forEach((num) => {
        sentenceQueue = sentenceQueue.concat(bookList[num].text)
      })

      sentenceQueue.forEach((str) => {
        splits = str.split(' ');
        
        // find a way to re-count based on numbers 
        // splits = convertNumsToText(splits);

        totalWordsToRead += splits.length;
      })

    } else {
      // The following grabs the text entered by the user and eliminates blank lines
      
      freeformText = textInput.value.replace(/^\s*\n/gm, "");
      
      totalWordsToRead = freeformText.split(' ').length;
      progress[0] = totalWordsToRead;
      
      let textArray = freeformText.split('\n');
      sentenceQueue = textArray;
    }
    
    progress[0] = totalWordsToRead;
    updateProgressBar(progress);

    if (shuffleBool) {
      sentenceQueue = shuffle(sentenceQueue)
    }

    sentenceCount = 0;
    loadTarget(sentenceQueue[sentenceCount])

    listenBool = true;
    recognition.start();

    columnWrap.classList.remove('disappear');
    startMenu.classList.add('disappear');
}

function nextRound(){
            
  if (sentenceCount < sentenceQueue.length - 1) {
    sentenceCount++
    loadTarget(sentenceQueue[sentenceCount])
  } else if (leftoversList.length > 0){
    leftoversRound();
  } else {
    
    updateAwards();              
    
    if(loopBool) {
      startRound();
    } else {
      endRound();
    }
  }
}

function endRound() {
  stopSpeechRecognition();
  
  timerBool = false;
  columnWrap.classList.add('disappear');
  startMenu.classList.remove('disappear');
}

function stopSpeechRecognition() {
  listenBool = false;
  recognition.abort();
}

function loadTarget(sentence, leftovers){
  targetColumn.innerHTML = '';
  texts.innerHTML = '';

  targetCount = 0;
  sentence = omitPunctuation(sentence);
  spokenSentence = sentence
  divided = sentence.toLowerCase().split(' ');

  divided = omitWords(divided);

  convertNumsToText(divided);

  for (let n = 0; n < divided.length; n++){
    newSpan = document.createElement('span');
    newSpan.setAttribute('id', ('target' + n));
    newSpan.classList.add('target');

    if (!leftovers) {
      leftButton = document.createElement('div');
      leftButton.classList.add('leftButton');
      leftButton.innerText = '◀';
      newSpan.appendChild(leftButton);
    }
  
    text = (divided[n]).toLowerCase()
    newContent = document.createTextNode(text);

    newSpan.appendChild(newContent);

    targetColumn.appendChild(newSpan);
  }

  updateTargetOrder();
}

function omitPunctuation(str) {
noPunct = str.replace(/[.,\/#!$%\^&\*;:{}=_`~()[\]?]/g,"")
            .replace(/\s+/g, " ");
return noPunct;
}

function omitWords(arr){
for (let n=0; n < arr.length; n++){
  if(cutOut.includes(arr[n])){
    arr.splice(n, 1);
  }
}

return arr;
}

function updateSentenceVisual(num) {
  correctWord = targetList[num];
  correctWord.classList.add('correct')

  skipBtn = correctWord.children[0]

  if (skipBtn) {
    skipBtn.classList.add('remove-skip');
  }

  if (num < divided.length - 1) {
    nextWord = targetList[num + 1];
    nextWord.classList.add('next');
  } 
}

function checkSentence(arr) {
  inputCount = 0

  arr.forEach((element) => {
    element = omitPunctuation(element);
      inputCount++;
      setTimeout(function(){
        let correct = false;

        if(element == divided[targetCount] || element.replace(/['-]/g,"") == divided[targetCount].replace(/['-]/g,"")){
          // are the two words exactly the same?
          // are the two words the same if you subtract apostrophes and hyphens?
          
          correct = true;
        } else {
          // are the two words homophones?
          
          homophones.forEach((set) =>{
            if (set.includes(element) && set.includes(divided[targetCount])){
              correct = true;
            }
          })
        } 

        if (correct) {
          score++;
          scoreMarker.innerText = score;

          // update progress bar
          progress[2]++;
          if (progress[0] > 0) {
            progress[0]--;
          } else {
            progress[1]--;
          }
          updateProgressBar(progress);
        
          updateSentenceVisual(targetCount);
          targetCount++;

          let success = new Audio("sound/boop.wav");
          success.play();
        
        if (targetCount > divided.length - 1) {

          if (JSON.stringify(arr) == JSON.stringify(divided)) {
            perfect.currentTime = 0;
            perfect.play();
            startRainbow();
          } else {
            next.currentTime = 0;
            next.play();
          }
          
          setTimeout(function() {nextRound()}, 700)
        }

      } else {
        //console.log('incorrect word');
      }

  }, (50 * inputCount));
})
}

function leftoversRound() {
  let leftoversString = ""
  
  for (let n = 0; n < leftoversList.length; n++){
    leftoversString = leftoversString.concat(leftoversList[n])
    if (n<leftoversList.length - 1){
      leftoversString = leftoversString.concat(' ')
    }
  }
  
  loadTarget(leftoversString, true);
  leftoversList = [];
}

function convertNumsToText(arr) {
  n = 0;
  arr.forEach((element) => {
    if (!isNaN(element)) {

      console.log(element.length);

      
      onesNum = element % 10;

      if (onesNum > 0) {
        arr.splice(n, 1, onesDigits[onesNum])
      } else {
        arr.splice(n, 1)
      }

      if (element.length > 1){
        tensNum = (element % 100 - element % 10) / 10;
        if (tensNum > 0) {
          if(tensNum < 2){
            arr.splice(n, 1, tweenDigits[onesNum]);
          } else {
            arr.splice(n, 0, tensDigits[tensNum]);
          }
        }
      }
      if (element.length > 2){
        hundredsNum = (element % 1000 - (element % 100))/100

        if (hundredsNum > 0) {
          arr.splice(n, 0, "hundred")
          arr.splice(n, 0, onesDigits[hundredsNum])
        }
      }
      if (element.length > 3){
        thousandsNum = (element % 10000 - element % 1000)/1000
        
        arr.splice(n, 0, "thousand")
        if (thousandsNum > 0){
          arr.splice(n, 0, onesDigits[thousandsNum]);
        }
      }
      if (element.length > 4){
        tenThousandsNum = (element % 100000 - element % 10000)/10000

        if (tenThousandsNum > 0) {
          if (tenThousandsNum < 2) {
            arr.splice(n, 1, tweenDigits[thousandsNum]);
          } else {
            arr.splice(n, 0, tensDigits[tenThousandsNum]);
          }
        }
      }
      if (element.length > 5){
        hundredThousandsNum = (element % 1000000 - element % 100000)/100000

        if (hundredThousandsNum > 0) {
          arr.splice(n, 0, "hundred")
          arr.splice(n, 0, onesDigits[hundredThousandsNum])
        }
      }
    }
    n++;
  })

  return arr;
}

function updateAwards() {
  previousAwards.innerText += currentAwards.innerText;
  currentAwards.innerText = ""
  
  if (presetBool){
                
    indexArray.forEach((num) => {
      currentAwards.innerText += bookList[num].award;
    })
    
  } else {
    currentAwards.innerText += bookList[0].award;
  }
}

function togglePresets() {
  if (presetBool) {
    presetBtn.innerHTML = 'Preset'
    presetBool = false;
    textInput.classList.remove('disappear');
    presetOpts.innerHTML = '';
  } else {
    presetBtn.innerHTML = 'Freeform'
    presetBool = true;
    textInput.classList.add('disappear');
    spawnPresetOptions();
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

function cycleTimers() {
  if (timerSetting < 2) {
    timerBtn.classList.add('flip')
    timerSetting ++
  } else {
    timerBtn.classList.remove('flip')
    timerSetting = 0;
  }
  timerBtn.innerHTML = timerInnerTexts[timerSetting]
  console.log(timerSetting)
}

function shuffle(arr){
  let unshuffled = arr;
  let shuffled = [];

  unshuffled.forEach(word =>{
      randomPos = Math.round(Math.random() * shuffled.length);

      shuffled.splice(randomPos, 0, word);
  })
  
  // console.log(shuffled);
  return shuffled;
}

function spawnPresetOptions() {
  n = 0;

  titleList.forEach((element) => {
    currentID = 'preset' + n;
    
    let preset = document.createElement('input');
    preset.type = 'checkbox';
    preset.id = currentID;
    preset.classList.add('opt');

    let newLabel = document.createElement('label');
    newLabel.htmlFor = currentID;
    newLabel.innerText = titleList[n];

    presetOpts.appendChild(preset);
    presetOpts.appendChild(newLabel);
    presetOpts.appendChild(document.createElement('br'));
    n++
  })
}

function loadJSON(){
  fetch('./data/books.json')
  .then(res => {
      if (res.ok) {
          console.log('SUCCESS');
      } else {
          console.log('FAILURE')
      }
      return res.json()
  })
  .then(data => {
      bookList = data;

      for (var key in data) {
          titleList.push((data[key].title + " pt. " + data[key].part));
      }
  })
  .catch(error => console.log('ERROR'))

}

function loadHomophones(){
  fetch('./data/homophones.json')
  .then(res => {
      if (res.ok) {
          console.log('SUCCESS');
      } else {
          console.log('FAILURE')
      }
      return res.json()
  })
  .then(data => {
      homophones = data;
  })
  .catch(error => console.log('ERROR'))
}

loadJSON();

loadHomophones();

function startTimer(sec) {
  ding = new Audio("sound/ding.wav");
  ding.play();

  timerInterval = setInterval(function(){
    
    writeToStopwatch(sec);

    if (timerBool == true){
      if(timerSetting == 1) {
        sec++;

      } else if (timerSetting == 2){
        if (sec > 0) {
          sec--;

        } else {
          clearInterval(timerInterval);
          startTimer(defaultCountdown);

          flip(stopwatch);
        }
      }
    } else {
      clearInterval(timerInterval);
    }
  }, 999)
}

function writeToStopwatch(sec) {
  var minString;
  var secString;
    
  if(sec < 600) {
    minString = "0" + Math.floor(sec/60)
  } else {
    minString = Math.floor(sec/60)
  }

  if((sec % 60) < 10) {
    secString = "0" + (sec%60)
  } else {
    secString = (sec%60)
  }
  
  
  timeString =  minString + ":" + secString;
  
  stopwatch.innerHTML = timeString;
}

function flip(element) {
  elStyle = element.classList;
  if (elStyle.contains('flip')) {
    elStyle.remove('flip');
  } else {
    elStyle.add('flip');
  }
}

function moveToleftoversList (n) {
  leftoversList.push(divided[n]);
  // console.log('pushed item to leftovers')
  divided.splice(n, 1);

  deleteSpan = targetList[n];
  deleteSpan.remove();

  updateTargetOrder();
  
  // update progress bar
  progress[1]++;
  progress[0]--;

  updateProgressBar(progress)

  if (n > targetList.length - 1 && targetCount == n){
    nextRound();
  }
}

function updateTargetOrder() {
  targetList = Array.from(document.getElementsByClassName('target'));
}

document.addEventListener('click', function(e) {
  e = e || window.event;
  var target = e.target || e.srcElement,
      text = target.textContent || target.innerText;  
  
  if(target.classList.contains('leftButton')){
    
    currentID = target.parentNode.id

    for (let n = 0; n < targetList.length; n++){
      if (targetList[n].id == currentID) {
        setTimeout(function() {moveToleftoversList(n)}, 5);
      }
    }
  } else if (target.classList.contains('target')){
    word = target.innerText.replace(/◀/g,"")
    
    speak(word);
  }
       
}, false);

function updateProgressBar(arr) {
  let incomplete = 100 * arr[0] / totalWordsToRead;
  let leftover = 100 * arr[1] / totalWordsToRead;
  let complete = 100 * arr[2] / totalWordsToRead;

  progressParts[0].style.height = incomplete + "%";
  progressParts[1].style.height = leftover + "%";
  progressParts[2].style.height = "calc(" + complete + "% + 70px)";
}

function speak(str) {
  stopSpeechRecognition();
  
  if(str) {
    utterance = new SpeechSynthesisUtterance(str);
    utterance.rate = 0.4;
  } else {
    utterance = new SpeechSynthesisUtterance(spokenSentence);
    utterance.rate = 0.4;
  }
  
  utterance.lang = 'en';

  if (speechSynthesis.speaking) {
    // SpeechSyn is currently speaking, cancel the current utterance(s)
    speechSynthesis.cancel();
  }

  speechSynthesis.speak(utterance);

  utterance.addEventListener("end", (event) => {
    console.log(
      `Utterance has finished being spoken after ${event.elapsedTime} seconds.`,
    );
    listenBool = true;
    recognition.start();
  });
}

let microphone;

function setup(){
  let cnv = createCanvas(100, 100);
  cnv.mousePressed(userStartAudio);
  cnv.style.position = "absolute";
  cnv.style.bottom = "0px";
  textAlign(CENTER);
  microphone = new p5.AudioIn();
  microphone.start();
}

function draw(){
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

const arrow = document.getElementById('rainbowEffect');

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
var movingRainbow = rainbowValues

direction = 90;
opacity = 1;

function generateRainbow(arr){
    direction += 1;
    opacity -= 0.01;

    rainbowStr = "linear-gradient(" + direction + "deg, "

    arr.forEach((element) =>{
        rainbowStr += (element + opacity + "), ")
    })
    rainbowStr = rainbowStr.substring(0, rainbowStr.length - 2);
    rainbowStr += ")";

    return rainbowStr;
}

function moveArray(arr) {
    arr.push(arr[0]);
    arr.shift();

    return arr;
}

function startRainbow(){
  opacity = 1;
  direction = Math.floor(Math.random() * 180)
  var timesRun = 0;
  var rainbowCycle = setInterval(function() {
    timesRun += 1;

    if(timesRun > 100){
      clearInterval(rainbowCycle);
    }
  
    moveArray(movingRainbow);
    arrow.style.background = generateRainbow(movingRainbow);
  
  }, 20);
}
