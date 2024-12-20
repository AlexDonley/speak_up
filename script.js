// - - - ELEMENTS - - - //

const userAgent = navigator.userAgent;

// ux elements that show the user whether their setup can successfully run Speak Up!
// currently requires Chromium and mic permissions

const chromeIcon = document.getElementById("chromeIcon");
const mic = document.getElementById("mic");


// ux elements that show user progress through arrow movement, score, timer, and awards

const progressParts   = Array.from(document.getElementsByClassName('bar-part'))
const arrow           = document.getElementById('rainbowEffect')
const stopWatch       = document.getElementById("stopWatch")
const currentAwards   = document.getElementById("currentAwards")
const previousAwards  = document.getElementById("previousAwards")
const awardsTab       = document.getElementById("awardsTab")
const scoreMarker     = document.getElementById("scoreMarker")
const langDisplay     = document.getElementById("langDisplay")
const synthSpeed      = document.getElementById("synthSpeed")
const synthVol        = document.getElementById("synthVol")
const speedReader     = document.getElementById("speedReader")
const volReader       = document.getElementById("volReader")

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

const columnWrap      = document.getElementById("columnWrap");
const targetColumn    = document.querySelector(".targetColumn");
const texts           = document.querySelector(".texts");

const viewQR          = document.getElementById('viewQR')

const userEntry       = document.getElementById('userEntry')
const availableUsers  = document.getElementById('availableUsers')
const userName        = document.getElementById('userName')

// - - - VARIABLES - - - //


// arrays for sentences and subdivisions

sentenceQueue = []
divided       = []
indexArray    = []
targetList    = []
leftoversList = []
completionMap = []

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

presetBool      = false
shuffleBool     = false
loopBool        = false
timerBool       = false
listenBool      = false
fullscreenBool  = false

let microphone;
let synthVoices


// setting for P5 sawtooth frequency

defaultFreq = 400


// settings for timer

defaultCountdown = 10;
timerSetting = 1;
timerObj = {
  "start": null,
  "target": null,
}


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

let next    = new Audio("sound/chaching.webm");
let perfect = new Audio("sound/wow.mp3");
let ding    = new Audio("sound/ding.wav");
ding.volume = 0.3
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
  mic.classList.remove('flip');
}

function checkForMic() {
  navigator.getUserMedia({ audio: true }, micSuccess, micFail);
}

checkForMic()


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
    completionMap   = []

    totalWordsToRead = 0
    progress = [0, 0, 0]

    if(!timerBool & timerSetting > 0){
      timerBool = true
      startTimer()
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
    

    for (i=0; i<sentenceQueue.length; i++) {
      nextWordsArr = processStrToArr(sentenceQueue[i])
      nextCompletionArr = []

      nextWordsArr.forEach(word => {
        nextCompletionArr.push(0)
      })

      completionMap.push(nextCompletionArr)

      fullTextArray = fullTextArray.concat(nextWordsArr)
    }

    console.log(completionMap)
    totalWordsToRead = fullTextArray.length

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
  contentBlocks.style.left = "0%"
  stopSpeechRecognition();
  
  timerBool = false;
  clearInterval(timerInterval);

  setTimeout(() => {
    targetColumn.innerHTML = ''
    texts.innerHTML = ''
  }, 275)

  // uncheck all boxes
  checkboxes = document.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach(box => {
    box.checked = false
  })
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
          
          updateScore(1)

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

          // update completion map
          completionMap[sentenceCount][targetCount - 1] = 1          

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

function updateScore(n) {
  score += n
  scoreMarker.innerText = score

  if(!(currentUserIndex == null)) {
    userInfo[currentUserIndex].user_score = score
    saveUserDataLocally()
  }
}

function convertNumsToText(arr) {
  // this can be simplified

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
  
  if (presetBool) {
                
    indexArray.forEach((num) => {
      addOneAward(textIndex, num)
    })
    
  } else {
    addOneAward(0, 0)
  }
}

function addOneAward(textN, awardN) {
  thisAward = bookList[textN].parts[awardN].award
  
  currentAwards.innerText += thisAward;

  if (!(currentUserIndex == null)) {
    console.log('adding award to user data')
    
    const date = new Date()
    dayStamp = date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate()

    awardArray = [thisAward, dayStamp]

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

function cycleTimers() {
  if (timerSetting < 2) {
    timerBtn.classList.add('flip')

    timerSetting ++
    if (timerSetting == 1) {
      timerBtn.children[0].style.clipPath = 
      "polygon(0% 33%, 50% 0%, 100% 33%, 80% 33%, 80% 100%, 20% 100%, 20% 33%)"
    } else {
      timerBtn.children[0].style.clipPath = 
      "polygon(20% 0%, 20% 66%, 0% 66%, 50% 100%, 100% 66%, 80% 66%, 80% 0%)"
    }
  } else {
    timerBtn.classList.remove('flip')
    timerSetting = 0;
    timerBtn.children[0].style.clipPath = 
    "polygon(0% 0%, 33% 0%, 50% 20%, 66% 0%, 100% 0%, 100% 33%, 80% 50%, 100% 66%, 100% 100%, 66% 100%, 50% 80%, 33% 100%, 0% 100%, 0% 66%, 20% 50%, 0% 33%)"
  }
  console.log(timerSetting)
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

function toggleQR() {
  if (viewQR.classList.contains('hide')) {
    viewQR.classList.remove('hide')
  } else {
    viewQR.classList.add('hide')
  }
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

function updateSpeed() {
  speedReader.innerText = synthSpeed.value
}

function updateVol() {
  volReader.innerText = synthVol.value
}

function speak(str) {
  stopSpeechRecognition();
  
  if(str) {
    utterance = new SpeechSynthesisUtterance(str);
  } else {
    utterance = new SpeechSynthesisUtterance(spokenSentence); 
  }
  
  utterance.rate = synthSpeed.value;
  utterance.volume = synthVol.value;
  utterance.voice = synthVoices[voiceSelect.value]
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

const allVoicesObtained = new Promise(function(resolve, reject) {
  let voices = window.speechSynthesis.getVoices();
  if (voices.length !== 0) {
    resolve(voices);
  } else {
    window.speechSynthesis.addEventListener("voiceschanged", function() {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
      synthVoices = voices
      populateVoices(synthVoices)
    });
  }
});

allVoicesObtained.then(voices => 
  console.log(voices)
)

function populateVoices(arr) {
  for (let n = 0; n < arr.length; n++) {
    newOpt = document.createElement('option')
    newOpt.value = n
    newOpt.innerText = arr[n].name

    voiceSelect.append(newOpt)
  }
}

// Code for P5 canvas and other P5 functions

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

// Code for rainbow effect on arrow

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


// TIMER CODE

function startTimer() {
  // TIMER SETUP
  ding.play();

  timerObj.start = determineTime()
  displayTime()

  // TIMER INTERVAL LOOP
  timerInterval = setInterval(displayTime, 999)
}

function determineTime() {
  const date = new Date;
  // date.setTime(result_from_Date_getTime);

  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hour    = date.getHours();

  timeStr =   hour % 12 + ":" + 
              appendZero(minutes.toString()) + ":" + 
              appendZero(seconds.toString())
  
  nowRaw =  timeStampToSec(hour + ":" + 
            appendZero(minutes.toString()) + ":" + 
            appendZero(seconds.toString()))

  console.log(nowRaw)

  return nowRaw
}

function displayTime() {
  let rawSecDifference = determineTime() - timerObj.start
  let stampLength = 4
  let displayStamp

  if (timerSetting == 1) {
    if (rawSecDifference >= 36000) {
      stampLength = 8
    } else if (rawSecDifference >= 3600) {
      stampLength = 7
    } else if (rawSecDifference >= 600) {
      stampLength = 5
    }

    displayStamp = trimTimeStamp(secToTimeStamp(rawSecDifference)[1], stampLength)
  } else if (timerSetting == 2) {
    miniTimer = defaultCountdown - (rawSecDifference % defaultCountdown)

    if (miniTimer == defaultCountdown) {
      ding.play()
    }
    
    displayStamp = trimTimeStamp(secToTimeStamp(
      miniTimer
    )[1], String(miniTimer).length)
  }

  stopWatch.innerText = displayStamp

  if (timerBool == false) {
    clearInterval(timerInterval);
  }
}

function timeStampToSec(str) {
  timeStampArr = str.split(':')

  rawSecInt =     Number(timeStampArr[2])
  rawSecInt +=    Number(timeStampArr[1] * 60)
  rawSecInt +=    Number(timeStampArr[0] * 3600)

  return rawSecInt
}

function secToTimeStamp(int) {
  timeStampArr = [null, null, null]

  rawSec = int % 60
  rawMin = (int - rawSec) % 3600
  rawHour = (int - rawMin - rawSec)

  timeStampArr[2] = rawSec
  timeStampArr[1] = rawMin / 60
  timeStampArr[0] = rawHour / 3600

  stampsAndString = [
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

function flip(element) {
  elStyle = element.classList;
  if (elStyle.contains('flip')) {
    elStyle.remove('flip');
  } else {
    elStyle.add('flip');
  }
}

function showUserPage() {
  contentBlocks.style.left = "-200%"
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
    newButton = document.createElement('button')
    newButton.innerText = entry.user_name
    newButton.classList.add('user-btn')
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
  updateScore(userInfo[currentUserIndex].user_score)

  reloadAwards(currentUserIndex)
}

function reloadAwards(index) {
  clearAwards()
  
  checkLength = userInfo[index].user_awards.length

  if (checkLength > 0) {
    currentAwards.innerText += userInfo[index].user_awards[
      checkLength - 1
    ][0];

    if (checkLength > 1) {
      for (let i = checkLength - 2; i > -1 && i > checkLength - 5; i--) {
        previousAwards.append(userInfo[index].user_awards[i][0])
      }
    }

    if (checkLength > 3) {
      for (let i=0; i<checkLength - 4; i++) {
        awardsTab.prepend(userInfo[index].user_awards[i][0])
      }
    }
  }
}

function clearAwards() {
  currentAwards.innerText = ''
  previousAwards.innerText = ''
  awardsTab.innerText = ''
}