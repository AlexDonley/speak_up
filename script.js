// - - - ELEMENTS - - - //

const userAgent = navigator.userAgent;

// ux elements that show the user whether their setup can successfully run Speak Up!
// currently requires Chromium and mic permissions

const chromeIcon = document.getElementById("chromeIcon");
const mic = document.getElementById("mic");


// ux elements that show user progress through arrow movement, score, timer, and awards

const progressParts = Array.from(document.getElementsByClassName('bar-part'));
const arrow = document.getElementById('rainbowEffect');
const stopwatch = document.getElementById("stopwatch");
const currentAwards = document.getElementById("currentAwards");
const previousAwards = document.getElementById("previousAwards");
const scoreMarker = document.getElementById("scoreMarker");
const langDisplay = document.getElementById("langDisplay")


// elements contained in the setting section

const contentBlocks = document.getElementById("contentBlocks")
const startMenu = document.getElementById("startMenu");
const textInput = document.getElementById("textInput");
const presetBtn = document.getElementById("preset");
const shuffleBtn = document.getElementById("shuffle");
const timerBtn = document.getElementById("timer")
const loopBtn = document.getElementById("loop");

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

  updateTitles(searchList);
})

// elements contained in the action section
// action section contains two columns, one for target words and the other for user input

const columnWrap = document.getElementById("columnWrap");
const targetColumn = document.querySelector(".targetColumn");
const texts = document.querySelector(".texts");



// - - - VARIABLES - - - //


// arrays for sentences and subdivisions

sentenceQueue = [];
divided = [];
indexArray = [];
targetList = [];
leftoversList = [];

// index markers for working through the above arrays

targetCount = 0;
inputCount = 0;
sentenceCount = 0;
textIndex = 0;


// arrays for processing numbers (numerals to strings)

onesDigits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
tweenDigits = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
tensDigits = ['zero', 'teen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']


// array of words to omit from target language and user input

cutOut = ["ah", "ahh", "aha", "mm", "mmm", "hm", "hmm", "mhm", "uh", "ah", "huh", "eh", "sh", "shh"]


// boolean variables that control whether features are on or off
//    presetBool   - false means freeform, true means preset
//    shuffleBool  - false means chronological targets, true means shuffled targets
//    loopBool     - false means finishes after 1 iteration, true means continues iterating until the user stops
//    timerBool    - false means timer does not count, true means timer counts
//    listenBool   - false means the browser does not intake mic input, true means the browser does intake mic input

presetBool = false;
shuffleBool = false;
loopBool = false;
timerBool = false;
listenBool = false;

let microphone;


// setting for P5 sawtooth frequency

defaultFreq = 400


// settings for timer

defaultCountdown = 10;
timerSetting = 1;
timerInnerTexts = [
  '<div class="behind">&#10006;</div><ion-icon name="timer-outline"></ion-icon>',
  '&#9650;<br><ion-icon name="timer-outline"></ion-icon>',
  '<ion-icon name="timer-outline"></ion-icon><br>&#9660;'
]


// settings for the arrow and rainbow

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


// variables to fill with JSON data using fetch

let bookList;
let titleList = [];
let homophones;
let zhuyin;


// sound effects

let next = new Audio("sound/chaching.webm");
let perfect = new Audio("sound/wow.mp3");
let spokenSentence; 

let targetLang = 'en'

// variables for scoring and progress

let score = 0;

// order for progress bar data will be incomplete, leftover, complete

progress = [0, 0, 0];
totalWordsToRead = 0;
updateProgressBar(progress);

scoreMarker.innerText = score;


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



// - - - SPEECH RECOGNITION SNIPPET - - - //

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

function setLanguage(str) {
  targetLang = str
  recognition.lang = targetLang
  langDisplay.innerText = str
}

setLanguage('en');

recognition.addEventListener("result", (e) => {
  
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  wordlist = processStrToArr(text)

  texts.innerHTML = ""
  n = 0

  wordlist.forEach((element) => {
    let inputWord = document.createElement('span');
    inputWord.setAttribute('id', ('input' + n));
    inputWord.innerText = element;
    texts.appendChild(inputWord);
    n++;
  })

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

// - - - END OF SPEECH RECOGNITION SNIPPET - - - //


function startRound() {
    // clear sentence queue
    sentenceQueue = []
    leftoversList = []
    fullTextArray = []

    totalWordsToRead = 0;
    progress = [0, 0, 0];
    

    if(!timerBool & timerSetting > 0){
      timerBool = true;
      
      if (timerSetting == 1) {
        startTimer(0)
      } else if (timerSetting == 2) {
        startTimer(defaultCountdown);
      }
    }
  
    // check if the sentence queue will be preset or freeform

    if (presetBool) {
      // PRESET INPUT
      // set the target language

      if (bookList[textIndex].lang != undefined) {
        setLanguage(bookList[textIndex].lang)
      } else {
        setLanguage('en')
      }
      
      // clear the index array
      indexArray = [];
      
      // see which boxes are checked
      checkboxes = document.querySelectorAll('input[type="checkbox"]');

      for (let n = 0; n < checkboxes.length; n++){
        if (checkboxes[n].checked) {
            indexArray.push(n);
        }
      }

      indexArray.forEach((num) => {
        sentenceQueue = sentenceQueue.concat(bookList[textIndex].parts[num].text)
      })

    } else {
      // FREEFORM INPUT
      // The following grabs the text entered by the user and eliminates blank lines
      
      freeformText = textInput.value.replace(/^\s*\n/gm, "");
      sentenceQueue = freeformText.split('\n');
    }
    
    sentenceQueue.forEach((str) => {
  
      fullTextArray = fullTextArray.concat(processStrToArr(str));

    })

    console.log(fullTextArray)

    totalWordsToRead = fullTextArray.length
    console.log(totalWordsToRead)

    progress[0] = totalWordsToRead
    updateProgressBar(progress);

    if (shuffleBool) {
      sentenceQueue = shuffle(sentenceQueue)
    }

    sentenceCount = 0;
    loadTarget(sentenceQueue[sentenceCount])

    listenBool = true;
    recognition.start();

    contentBlocks.style.left = "-100%"
}

function nextRound(){
  
  defaultFreq = Math.floor(Math.random() * 400) + 100

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
  clearInterval(timerInterval);

  contentBlocks.style.left = "0%"
  setTimeout(() => {
    targetColumn.innerHTML = ''
    texts.innerHTML = ''
  }, 275)
}

function stopSpeechRecognition() {
  listenBool = false;
  recognition.abort();
}

function loadTarget(sentence, leftovers){
  targetColumn.innerHTML = '';
  texts.innerHTML = '';

  targetCount = 0;

  spokenSentence = sentence
  divided = processStrToArr(sentence);

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
noPunct = str.replace(/[.。…—,，\/#!$%\^&\*;；{}=_`~()[\]?]/g,"")
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
          
          if (targetLang == 'zh') {
            var elemIndex = zhuyin.findIndex(p => p.char == element);
            var divIndex = zhuyin.findIndex(p => p.char == divided[targetCount]);

            zhu1 = zhuyin[elemIndex].bpmf[0];
            zhu2 = zhuyin[divIndex].bpmf[0];

            console.log(zhu1, zhu2)
            
            if (zhu1 == zhu2) {
              correct = true;
            }
          } else {
            homophones.forEach((set) =>{
              if (set.includes(element) && set.includes(divided[targetCount])){
                correct = true;
              }
            })
          }

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

          // let success = new Audio("sound/boop.wav");
          // success.play();

          defaultFreq += 30

          beep.start();
          beep.freq(defaultFreq);
          beep.amp(.1);
          setTimeout(function() {
            beep.stop();
          }, 45)
        
        if (targetCount > divided.length - 1) {

          if (JSON.stringify(arr) == JSON.stringify(divided)) {
            // perfect.currentTime = 0;
            // perfect.play();
            next.currentTime = 0;
            next.play();
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
  // this can be simplified with recursion

  n = 0;
  arr.forEach((element) => {
    // first, the function parses the use of : to determine if it should be kept or omitted
    // if the : is used in a timestamp such as 6:00, it should be kept
    // the if statement below checks for a word that contains a semicolon, but the characters on either side of that colon are not numbers
    // that word is replaced by an word without the semicolon
    
    colonIndex = element.indexOf(":")

    if (
      colonIndex >= 0 &&
      (isNaN(element.substring(colonIndex - 1, colonIndex)) ||
      isNaN(element.substring(colonIndex + 1, colonIndex + 2)) ||
      colonIndex - 1 < 0 ||
      colonIndex + 1 >= element.length)
    ) {
      element = element.replace(/[:]/g,"")
      arr.splice(n, 1, element)
    }
    
    if (!isNaN(element)) {
      
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
        
        if (thousandsNum > 0){
          arr.splice(n, 0, "thousand")
          arr.splice(n, 0, onesDigits[thousandsNum]);
        }
      }
      if (element.length > 4){
        tenThousandsNum = (element % 100000 - element % 10000)/10000

        
        if (tenThousandsNum > 0) {
          if (!arr.includes("thousand")) {
            arr.splice(n, 0, "thousand")
          }

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
          if (!arr.includes("thousand")) {
            arr.splice(n, 0, "thousand")
          }
          arr.splice(n, 0, "hundred")
          arr.splice(n, 0, onesDigits[hundredThousandsNum])
        }
      }
      if (element.length > 6){
        millionsNum = (element % 10000000 - element % 1000000)/1000000
        
        if (millionsNum > 0) {
          arr.splice(n, 0, "million")
          arr.splice(n, 0, onesDigits[millionsNum])
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
      currentAwards.innerText += bookList[textIndex].parts[num].award;
    })
    
  } else {
    currentAwards.innerText += bookList[0].parts[0].award;
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

function updateTitles(arr) {
  titleCards.innerHTML = ""
  
  arr.forEach((element) => {
    newTitle = document.createElement('div');
    newTitle.innerText = element;
    newTitle.classList.add('preset-line');
    newTitle.classList.add('one-title');
    titleCards.appendChild(newTitle)
  });
}

function loadBooks(){
  fetch('./data/books.json')
  .then(res => {
      if (res.ok) {
          console.log('BOOKS FETCHED');
      } else {
          console.log('BOOKS FAILURE')
      }
      return res.json()
  })
  .then(data => {
      bookList = data;

      for (var key in data) {
          titleList.push(data[key].title);
      }
      updateTitles(titleList);
  })
  .catch(error => console.log(error))

}

function loadHomophones(){
  fetch('./data/homophones.json')
  .then(res => {
      if (res.ok) {
          console.log('HOMOPHONES FETCHED');
      } else {
          console.log('HOMOPHONES FAILURE')
      }
      return res.json()
  })
  .then(data => {
      homophones = data;
  })
  .catch(error => console.log(error))
}

function loadZhuyin() {
  fetch('./data/hz-bpmf.json')
  .then(res => {
    if (res.ok) {
      console.log('ZHUYIN FETCHED');
    } else {
        console.log('ZHUYIN FAILURE')
    }
    return res.json()
  })
  .then(data => {
    zhuyin = data;
  })
  .catch(error => console.log(error))
}

loadBooks();
loadHomophones();
loadZhuyin();

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

  } else if (target.classList.contains('one-title')) {
    
    clearHighlight = document.getElementsByClassName('title-highlight')
    if(clearHighlight[0]) {
      clearHighlight[0].classList.remove('title-highlight')
    }

    target.classList.add('title-highlight');
    textIndex = titleList.indexOf(target.innerText);
    updateParts(textIndex);

  }
       
}, false);

function updateParts(n) {
  partsCards.innerHTML = "";

  x = 0;

  bookList[n].parts.forEach(element =>{
    currentID = 'part' + x;
    preview = (x + 1) + " - " + element.text[0];
    
    let preset = document.createElement('input');
    preset.type = 'checkbox';
    preset.id = currentID;

    let preLabel = document.createElement('label');
    preLabel.htmlFor = currentID;
    preLabel.innerText = element.award;
    
    let partPreview = document.createElement('div');
    partPreview.id = "label" + x;
    partPreview.innerText = preview;

    let divWrap = document.createElement('div');
    divWrap.appendChild(preset);
    divWrap.appendChild(preLabel);
    divWrap.appendChild(partPreview);
    divWrap.classList.add('one-part');
    divWrap.classList.add('preset-line');

    partsCards.appendChild(divWrap);
    x++
  })
}


function processStrToArr(str) {
  // first, cut out general punctuation from the entire string
  // this function does not cut out -, ', and : since they have semantic use
  
  zeroPunct = omitPunctuation(str)

  // second, split the string into an array of words
  // this will depend on language: most languages split based on spaces, but others split on every word
  
  if (targetLang == 'zh') {
    splitArr = zeroPunct.toLowerCase().split('')
  } else {
    splitArr = zeroPunct.toLowerCase().split(' ')
  }

  // third, convert digits to text strings
  // this function will parse the use of : to see if it's necessary to communicate a time, or if it's grammatical and should be omitted
  
  numsArr = convertNumsToText(splitArr)

  // fourth, omit words from the array that aren't possible to produce through speech recognition
  // or are inappropriate for general use.

  finalArr = omitWords(numsArr)

  return finalArr
}


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
  
  utterance.lang = targetLang;

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


function setup(){
  let cnv = createCanvas(100, 100);
  cnv.mousePressed(userStartAudio);

  textAlign(CENTER);
  microphone = new p5.AudioIn();
  microphone.start();

  beep = new p5.Oscillator();
  beep.setType('sawtooth')
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
