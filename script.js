const texts = document.querySelector(".texts");
const target = document.querySelector(".target");
const title = document.querySelector("h1")

const columnWrap = document.getElementById("columnWrap");
const startMenu = document.getElementById("startMenu");
const textInput = document.getElementById("textInput");
const presetBtn = document.getElementById("preset");
const presetOpts = document.getElementById("presetOptions")

log = ""
divided = [];
sentenceQueue = []
targetCount = 0;
inputCount = 0;
listenBool = false;
presetBool = false;
awards = ['💪', '💅', '🧠', '👌', '🥳']
punct = [
  '.', ',', '!', ':', ';', '?', '"', "'", 
  '(', ')', '[', ']', '{', '}', '<', '>', '`', '~',  
  '@', '#', '$', '%', '^', '&', '*', '_', '+', '=', '|', '/']

BigGreenMonster1 = [
  "big green monster has 2 big yellow eyes",
  "a long bluish greenish nose",
  "a big red mouth with sharp white teeth",
  "two little squiggly ears",
  "scraggly purple hair", 
  "and a big scary green face",
  "but you don't scare me"
]
BigGreenMonster2 = [
  "so go away scraggly purple hair",
  "go away two little squiggly ears",
  "go away long bluish greenish nose",
  "go away big green face",
  "go away big red mouth",
  "go away sharp white teeth",
  "go away two big yellow eyes",
  "go away big green monster", 
  "and don't come back until I say so"
]
Grasshopper1 = [
  "the road went up a steep hill",
  "grasshopper climbed to the top",
  "look a large apple lying on the ground",
  "I will have my lunch",
  "he ate a big bite of the apple",
  "look what you did",
  "there was a worm living in the apple",
  "you have made a hole in my roof"
]
Grasshopper2 = [
  "it is not polite to eat a person's house",
  "I am sorry",
  "just then the apple began to roll down the road",
  "it rolled down the other side of the hill",
  "stop me catch me",
  "you are rolling faster and faster"
]
Grasshopper3 = [
  "worm's head was bumping on the walls",
  "i hear his dishes falling off the shelf",
  "grasshopper ran after the apple",
  "my bathtub is in the living room",
  "my bed is in the kitchen",
  "grasshopper kept running down the hill",
  "but he could not catch the apple",
  "everything is a mess in there"
]
Grasshopper4 = [
  "are you getting dizzy",
  "my floor is on the ceiling",
  "my attic is in the cellar",
  "the apple rolled all the way down to the bottom of the hill",
  "the apple hit a tree",
  "it smashed into a hundred pieces",
  "too bad worm your house is gone"
]
Grasshopper5 = [
  "the worm climbed up the side of the tree",
  "oh never mind",
  "it was old and it had a bite in it anyway",
  "this is a fine time for you to find a new house",
  "grasshopper looked up into the tree", 
  "it was filled with apples", 
  "grasshopper smiled and he went on down the road"
]

titles = [
  "Big Green Monster pt. 1", 
  "Big Green Monster pt. 2", 
  "A New House pt. 1", 
  "A New House pt. 2",
  "A New House pt. 3", 
  "A New House pt. 4",
  "A New House pt. 5"
]

presets = [
  BigGreenMonster1, 
  BigGreenMonster2, 
  Grasshopper1, 
  Grasshopper2, 
  Grasshopper3,
  Grasshopper4,
  Grasshopper5
];

sentenceCount = 0;

numbersToText = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

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
        sentenceQueue = sentenceQueue.concat(presets[num])
      })

      console.log(sentenceQueue);

    } else {
      let textArray = textInput.value.split('\n');
      console.log(textArray);
      sentenceQueue = textArray;
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
  recognition.abort();
    
  columnWrap.classList.add('disappear');
  startMenu.classList.remove('disappear');

  title.innerText += awards[0];
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
          
          setTimeout(function(){
            
            if (sentenceCount < sentenceQueue.length - 1) {
              sentenceCount++
              loadTarget(sentenceQueue[sentenceCount])
            } else {
              endRound();
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

function spawnPresetOptions() {
  n = 0;

  presets.forEach((element) => {
    currentID = 'preset' + n;
    
    let preset = document.createElement('input');
    preset.type = 'checkbox';
    preset.id = currentID;
    preset.classList.add('opt');

    let newLabel = document.createElement('label');
    newLabel.htmlFor = currentID;
    newLabel.innerText = titles[n];

    presetOpts.appendChild(preset);
    presetOpts.appendChild(newLabel);
    presetOpts.appendChild(document.createElement('br'));
    n++
  })
}