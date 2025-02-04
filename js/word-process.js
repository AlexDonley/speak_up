// import { omitPunctuation, omitWords, parseColon, numToTexts, genWPStrToArr } from './word-process.js'
import { charToPin } from './ruby-text.js'


// arrays for processing numbers (numerals to strings)
const digitsObj = {
    allDigits: [
        [
        'zero', 'one', 'two', 'three', 'four', 
        'five', 'six', 'seven', 'eight', 'nine'
        ],
        [
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 
        'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
        ],
        [
        'zero', 'teen', 'twenty', 'thirty', 'forty', 
        'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
        ]
    ],
    chunkMarkers: ['thousand', 'million', 'billion']
}

// array of words to omit from target language and user input

const wordsToOmit = [
    "ah", "ahh", "aha", "mm", "mmm", 
    "hm", "hmm", "mhm", "uh", "ah", 
    "huh", "eh", "sh", "shh"
]

// Data to fetch

let engHomophones;
let zhZhuyin;

function loadHomophones(){
    fetch('./data/en_homophones.json')
    .then(res => {
        if (res.ok) {
            console.log('Fetched English homophones');
        } else {
            console.log('Couldnt fetch English homophones')
        }
        return res.json()
    })
    .then(data => {
        engHomophones = data;
    })
    .catch(error => console.log(error))
 }
  
function loadZhuyin() {
    fetch('./data/zy_monochars.json')
    .then(res => {
        if (res.ok) {
            console.log('Fetched chars to Zhuyin');
        } else {
            console.log('Couldnt fetch chars to Zhuyin')
        }
        return res.json()
    })
    .then(data => {
        zhZhuyin = data;
    })
    .catch(error => console.log(error))
}

loadHomophones();
loadZhuyin();

// Functions

export function omitPunctuation(str) {
    const noPunct = str.replace(/[.。…—,，\/#!$%\^&\*;；{}=_`~()[\]?]/g,"").replace(/\s+/g, " ");
    return noPunct;
}
    
export function omitWords(arr){
    for (let n=0; n < arr.length; n++){
        if(wordsToOmit.includes(arr[n])){
            arr.splice(n, 1);
        }
    }
    
    return arr;
}

export function compareSents(targetArr, utterArr, mode, lang, startInd) {
    
    let sentCompletion = []
    let targMarker = 0

    if (startInd) {
        targMarker = startInd
    }

    if (mode == 'linear') {
        utterArr.forEach(spokenWord => {
            if (compareWords(targetArr[targMarker], spokenWord, lang)) {
                targMarker++
                sentCompletion.push(1)
            }
        })

        for (
            sentCompletion; 
            sentCompletion.length < targetArr.length - startInd; 
            sentCompletion.push(0)
        ) {}
    }

    console.log(sentCompletion, startInd, targMarker)
    return [sentCompletion, startInd, targMarker]
}

export function compareWords(targStr, utterStr, lang) {
    
    if (
        targStr == utterStr
        || targStr.replace(/['-]/g,"") == utterStr.replace(/['-]/g,"")
    ) {
        return true
    } else {
        if (lang == 'zh') {

            if (charToPin(targStr) == charToPin(utterStr)) {
                return true
            } else {
                return false
            }

        } else {
            let correct = false
            
            engHomophones.forEach((set) =>{
                if (set.includes(targStr) && set.includes(utterStr)){
                    correct = true;
                }
            })

            return correct
        }
    }
}

export function parseColon(str) {
    // this function parses use of : in strings
    // if the : is in a timestamp, it stays
    // if the : is not in a timestamp, it's omitted
  
    const colonIndex = str.indexOf(":")

    if (
        colonIndex >= 0 &&
        (isNaN(str.substring(colonIndex - 1, colonIndex)) ||
        isNaN(str.substring(colonIndex + 1, colonIndex + 2)) ||
        colonIndex - 1 < 0 ||
        colonIndex + 1 >= str.length)
    ) {
        str = str.replace(/[:]/g,"")
    }

    return str
}

export function numToTexts(int, andBool) {
    // convert to string, so the argument 
    // can be a string or integer

    // the incoming argument must have no punctuation
    int = String(int)
    let chunksArr = []
    let newTextsArr = []
    
    const numeralLen = int.length
    const numOfChunks = Math.ceil(numeralLen / 3)
    const frontChunk = numeralLen % 3

    // chunk it
    for (let i = 0; i < numOfChunks; i++) {
        let thisChunk

        if (i == 0) {
            thisChunk = int.substring(0, frontChunk)
        } else {
            thisChunk = int.substring(
                frontChunk + ((i - 1) * 3), 
                frontChunk + 3 + ((i - 1) * 3)
            )
        }

        chunksArr.push(thisChunk)
    }

    // loop through the chunks
    for (let n = 0; n < numOfChunks; n++) {
        
        const chunkSplit = chunksArr[n].split('')
        const isAllZero = chunkSplit.every(item => item == 0)

        if (!isAllZero) {
            const bigOrd = numOfChunks - n
            const thisChunkLength = chunkSplit.length
            let chunkText = []
  
            for (let m = 0; m < chunkSplit.length; m++) {
                const smallOrd = thisChunkLength - m
              
                if (chunkSplit[m] > 0) {
                    if (smallOrd == 1 || smallOrd == 3 ) {

                        if (smallOrd == 1 && !(chunkSplit[m-1] == 1)) {
                            chunkText.push(digitsObj.allDigits[0][chunkSplit[m]])
                        }
                      
                        if (smallOrd == 3) {
                            chunkText.push(digitsObj.allDigits[0][chunkSplit[m]])  
                            chunkText.push('hundred')
                        }
                    } else {
                        if (chunkSplit[m] == 1) {
                            chunkText.push(digitsObj.allDigits[1][chunkSplit[m+1]])
                        } else {
                            chunkText.push(digitsObj.allDigits[2][chunkSplit[m]])
                        }
                    }
                }
            }
  
            newTextsArr = newTextsArr.concat(chunkText)
            if (bigOrd > 1) {
                newTextsArr.push(digitsObj.chunkMarkers[bigOrd - 2])
                if (andBool) {
                    newTextsArr.push('and')
                }
            }
        }
    }
    return newTextsArr;
}

export function genWPStrToArr(str, lang) {
    
    str = str.toLowerCase()
    
    str = omitPunctuation(str)

    let newArr
    
    if (lang == 'zh') {
        newArr = str.split('')
    } else {
        newArr = str.split(' ')
    }

    newArr = omitWords(newArr)

    let n = 0

    newArr.forEach(word => {

        //add a function to account for $, degrees, %, #

        if (!isNaN(word)) {
            newArr.splice(n, 1, ...numToTexts(word))
        }
        
        n++
    })

    return newArr
}

export function queueToArr(arr, lang) {
    
    let newArr = []

    arr.forEach(sentence => {
        newArr.push(genWPStrToArr(sentence, lang))
    })

    return newArr
}