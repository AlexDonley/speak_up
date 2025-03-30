// import { synthSpeak } from './js/speech-synth.js'

let synthVoices

export function synthSpeak(str, speed, vol, lang, micBtn) {
    
    const synth = window.speechSynthesis
    const synthUtter = new SpeechSynthesisUtterance(str);
    micBtn.disabled = true
    
    synthUtter.rate = speed
    synthUtter.volume = vol
    // synthUtter.voice = synthVoices[voiceSelect.value]
    synthUtter.lang = lang;
  
    // SpeechSyn is currently synthSpeaking, cancel the current synthUtter(s)
    if (synth.speaking) { 
        synth.cancel();
    }
  
    synth.speak(synthUtter);
  
    synthUtter.addEventListener("end", (event) => {
        console.log(
            `Finished synthesizing utterance after ${event.elapsedTime / 1000} seconds.`,
        );
        if (micBtn) {
            micBtn.disabled = false;
        }
    });
}

const allVoicesObtained = new Promise(function(resolve, reject) {
    let voices = window.speechSynthesis.getVoices()

    if (voices.length !== 0) {
        resolve(voices);
    } else {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
            voices = window.speechSynthesis.getVoices()
            resolve(voices)

            synthVoices = voices
        })
    }
})
  
allVoicesObtained.then(voices => 
    console.log('Fetched voices')
    //console.log(voices)
)
