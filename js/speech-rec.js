// import {targetLang, speechRec, setLanguage} from './speech-rec.js'

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

var audiocount = 1;

export let targetLang = 'en'

export const speechRec = new SpeechRecognition();
speechRec.interimResults = true;
speechRec.continuous = false;

export let willLoop = true

export function setLanguage(str) {
    targetLang = str
    speechRec.lang = targetLang

    return str
}

export function startRecLoop(loopBool, interBool, contBool, langStr) {
    willLoop = loopBool
    
    speechRec.interimResults = interBool
    speechRec.continous = contBool
    speechRec.start()
}

// export const recResults = speechRec.addEventListener("result", (e) => {
    
//     // console.log(e.results)

//     const text = Array.from(e.results)
//         .map((result) => result[0])
//         .map((result) => result.transcript)
//         .join("");

//     console.log(text)

//     if (e.results[0].isFinal) {
//         return [text, 'final']
//     } else {
//         return [text, 'not final']
//     }
// })

speechRec.addEventListener("audiostart", () => {
    console.log('audio bite ' + audiocount + ' has started')
})

speechRec.addEventListener("audioend", () => {
    console.log('audio bite ' + audiocount + ' has ended')
    audiocount++
})

speechRec.addEventListener("end", () => {
    if(willLoop){
        speechRec.start();
    }
});

export function stopRecLoop() {
    willLoop = false
    
    speechRec.abort();
}