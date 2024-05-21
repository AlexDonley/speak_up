const texts = document.querySelector(".texts");
const target = document.querySelector(".target");
const title = document.querySelector("h1")
const columnWrap = document.getElementById("columnWrap");
const startMenu = document.getElementById("startMenu");
const textInput = document.getElementById("textInput");

log = ""
divided = [];
targetCount = 0;
inputCount = 0;
listenBool = false;
awards = ['💪', '💅', '🧠', '👌', '🥳']

sentenceQueue = [
  "big green monster has 2 big yellow eyes",
  "a long bluish greenish nose",
  "a big red mouth with sharp white teeth",
  "two little squiggly ears",
  "scraggly purple hair", 
  "and a big scary green face",
  "but",
  "you don't scare me"
]
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
    let textArray = textInput.value.split('\n');
    console.log(textArray);
    sentenceQueue = textArray;
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
    divided = sentence.toLowerCase().split(' ');

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

        let success = new Audio("boop.wav");
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
      console.log(element, numbersToText[element])
      arr.splice(n, 1, numbersToText[element])
    }
    n++;
  })

  return arr;
}