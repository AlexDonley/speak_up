const texts = document.querySelector(".texts");
const target = document.querySelector(".target");
const title = document.querySelector("h1")

const chromeIcon = document.getElementById("chromeIcon");
const mic = document.getElementById("mic");
const columnWrap = document.getElementById("columnWrap");
const leftOver = document.getElementById("leftOver");
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

divided = [];
sentenceQueue = [];
indexArray = [];
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

sentenceCount = 0;

numbersToText = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
cutOut = ["ah", "ahh", "mm", "mmm", "hm", "hmm", "mhm", "uh", "ah", "huh", "eh", "sh", "shh"]

let userAgent = navigator.userAgent;

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


// create event listener for microphone connections
// UNFINISHED

// async function getMicrophone() {
//   // Use audio only.
//   const constraints = { audio: true };

//   // Create the events.
//   const microphoneStartEvent = new Event('microphonestart');
//   const microphoneStopEvent = new Event('microphonestop');

//   // Create the stream.
//   const stream = await navigator.mediaDevices.getUserMedia(constraints);

//   // You'll want to know if a stream has randomly stopped without the user's intent. 
//   const tracks = stream.getAudioTracks();
//   for (const track of tracks) {
//     track.addEventListener('ended', () => {
//       window.dispatchEvent(microphoneStopEvent);
//     });
//   }

//   // Internal function to stop the stream and fire the microphonestop event.
//   const stopStream = () => {
//     const tracks = stream.getAudioTracks();
//     for (const track of tracks) {
//       track.stop();
//     }

//     window.dispatchEvent(microphoneStopEvent);
//   }

//   // Stream is running, fire microphonestart event.
//   window.dispatchEvent(microphoneStartEvent);

//   // Return both the stream and the stopStream function.
//   return {
//     stream,
//     stopStream
//   };
// }

// // Listen to the microphonestart event.
// window.addEventListener('microphonestart', () => {
//   console.log('user using microphone');
// });

// // Listen to the microphonestop event.
// window.addEventListener('microphonestop', () => {
//   console.log('user stopped using microphone');
// });

// // Start the stream.
// getMicrophone().then(({ stream, stopStream }) => {
//   // Use the stream.
//   console.log(stream);

//   // Stop the stream when you need.
//   stopStream();
// }).catch(error => {
//   console.error(error);
// });


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
  sentence = omitPunctuation(sentence);
  divided = sentence.toLowerCase().split(' ');

  divided = omitWords(divided);

  convertNumsToText(divided);

  for (let n = 0; n < divided.length; n++){
    newSpan = document.createElement('span');
    newSpan.setAttribute('id', ('target' + n));
    newSpan.classList.add('target');
    newSpan.onclick = function clone(){
      console.log('clone')
    };

    newContent = document.createTextNode((divided[n]).toLowerCase()+ " ");
    newSpan.appendChild(newContent);

    target.appendChild(newSpan);
  }
}

function omitPunctuation(str) {
noPunct = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()[\]?]/g,"")
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
    element = omitPunctuation(element);
      inputCount++;
      setTimeout(function(){
        let correct = false;

        if(element == divided[targetCount]){
          correct = true;
        } else {
          homophones.forEach((set) =>{
            if (set.includes(element) && set.includes(divided[targetCount])){
              console.log(set);
              correct = true;
            }
          })
        }
        
        if (correct) {
          //console.log('correct word');
        
        updateSentenceVisual(targetCount);
        targetCount++;

        let success = new Audio("sound/boop.wav");
        success.play();
        
        if (targetCount > divided.length - 1) {
          
          console.log(arr, divided)

          if (JSON.stringify(arr) == JSON.stringify(divided)) {
            perfect.currentTime = 0;
            perfect.play();
          } else {
            next.currentTime = 0;
            next.play();
          }
          
          
          
          setTimeout(function(){
            
            if (sentenceCount < sentenceQueue.length - 1) {
              sentenceCount++
              loadTarget(sentenceQueue[sentenceCount])
            } else {
              
              updateAwards();              
              
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

      //console.log(titleList);
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

let clickTarg;

document.body.onmousedown = function (e) {
  // Get IE event object
  e = e || window.event;
  // Get target in W3C browsers & IE
  var elementId = e.target ? e.target.id : e.srcElement.id;
  // ...
  if(elementId.includes('target')){
    clickTarg = document.getElementById(elementId);
    clickTarg.classList.add('drag')
    
    console.log(elementId);
    leftOver.classList.add('appear');

    dragElement(clickTarg);

    function dragElement(elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      
      elmnt.onmousedown = dragMouseDown;

      
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        console.log (pos3, pos4);
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = e.clientX - pos3;
        pos2 = e.clientY - pos4;
        // pos3 = e.clientX;
        // pos4 = e.clientY;
        // set the element's new position:
        // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        // elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        elmnt.style.transform = "translate(" + (pos1) + "px, " 
                                + (pos2) + "px)"
        // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        // elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;

        if (true) {
          // elmnt.style.top = "0px";
          // elmnt.style.left = "0px";
          elmnt.style.transform = "translate(0px, 0px)";
        }

      }
    }
  }
}

function removeLeftovers() {
  leftOver.classList.remove('appear');
  clickTarg.classList.remove('drag');
}