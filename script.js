const texts = document.querySelector(".texts");
const target = document.querySelector(".target");
const title = document.querySelector("h1")

const columnWrap = document.getElementById("columnWrap");
const startMenu = document.getElementById("startMenu");
const textInput = document.getElementById("textInput");
const presetBtn = document.getElementById("preset");
const shuffleBtn = document.getElementById("shuffle");
const timerBtn = document.getElementById("timer")
const loopBtn = document.getElementById("loop");
const presetOpts = document.getElementById("presetOptions");
const stopwatch = document.getElementById("stopwatch");

divided = [];
sentenceQueue = []
targetCount = 0;
inputCount = 0;
listenBool = false;
presetBool = false;
shuffleBool = false;
loopBool = false;
timerBool = false;

defaultCountdown = 10;
timerSetting = 0;
timerInnerTexts = [
  '&#10006;<ion-icon name="timer-outline"></ion-icon>',
  '&#9650;<br><ion-icon name="timer-outline"></ion-icon>',
  '<ion-icon name="timer-outline"></ion-icon><br>&#9660;'
]

let bookList;
let titleList = [];
awards = ['💪']

let perfect = new Audio("sound/wow.mp3");

sentenceCount = 0;

numbersToText = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

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

  wordlist = text.toLowerCase().split(' ')

  console.log(wordlist)

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
    
    checkSentence(wordlist)

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

      console.log(indexArray);

      indexArray.forEach((num) => {
        sentenceQueue = sentenceQueue.concat(bookList[num].text)
      })

      console.log(sentenceQueue);

    } else {
      let textArray = textInput.value.split('\n');
      console.log(textArray);
      sentenceQueue = textArray;
    }
    
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

function endRound() {
  listenBool = false;
  timerBool = false;
  recognition.abort();
    
  columnWrap.classList.add('disappear');
  startMenu.classList.remove('disappear');
}

function loadTarget(sentence){
    target.innerHTML = '';
    texts.innerHTML = '';
  
    targetCount = 0;
    noPunct = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()[\]?]/g,"")
              .replace(/\s+/g, " ");
    divided = noPunct.toLowerCase().split(' ');

    convertNumsToText(divided);

    for (let n = 0; n < divided.length; n++){
      newSpan = document.createElement('span');
      newSpan.setAttribute('id', ('target' + n))

      newContent = document.createTextNode((divided[n]).toLowerCase()+ " ");
      newSpan.appendChild(newContent);

      target.appendChild(newSpan);
    }
}

function updateSentenceVisual(num) {
    correctWord = document.getElementById('target' + num);
    correctWord.classList.add('correct')

    if (num < divided.length - 1) {
      nextWord = document.getElementById('target' + (num + 1));
      nextWord.classList.add('next');
    } 
}



function checkSentence(arr) {
  inputCount = 0
  
  arr.forEach((element) => {
      inputCount++;
      setTimeout(function(){
        if (element == divided[targetCount]) {
          //console.log('correct word');
        
        updateSentenceVisual(targetCount);
        targetCount++;

        let success = new Audio("sound/boop.wav");
        success.play();
        
        if (targetCount > divided.length - 1) {
          perfect.play();
          setTimeout(function(){
            
            if (sentenceCount < sentenceQueue.length - 1) {
              sentenceCount++
              loadTarget(sentenceQueue[sentenceCount])
            } else {
              title.innerText += awards[0];
              
              if(loopBool) {
                startRound();
              } else {
                endRound();
              }
            }
          }, 700)
        }

      } else {
        //console.log('incorrect word');
      }

  }, (50 * inputCount));
})
}

function convertNumsToText(arr) {
  n = 0;
  arr.forEach((element) => {
    if (!isNaN(element)) {
      arr.splice(n, 1, numbersToText[element])
    }
    n++;
  })

  return arr;
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
  
  console.log(shuffled);
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

      console.log(titleList);
  })
  .catch(error => console.log('ERROR'))

}

loadJSON();

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
