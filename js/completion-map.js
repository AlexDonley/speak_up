// import { 
//      genBlankCompMap, findInt, 
//      checkMapForZero, indexIntsFromMap, 
//      trackCompletion
// } from './js/completion-map.js'

import { compareWords } from './word-process.js'

export function genBlankCompMap(arr) {
    let compMap = []
    let wordCount = 0
    
    arr.forEach(innerArr => {

        let sentMap =[]

        innerArr.forEach(word => {
            sentMap.push(0)
            wordCount++
        })

        compMap.push(sentMap)
    })

    console.log(compMap, wordCount)
    return [compMap, wordCount]
}

export function findInt(arr, int) {
    return arr.indexOf(int)
}

export function checkMapForZero(map) {
    for (let n = 0; n < map.length; n++) {
        const check = findInt(map[n], 0)
        
        if (check > -1) {
            return [n, check]
        }
    }

    return false
}

export function checkMapForInt(map, int) {
    for (let n = 0; n < map.length; n++) {
        const check = findInt(map[n], int)
        
        if (check > -1) {
            return [n, check]
        }
    }

    return false
}

export function indexIntsFromMap(map, int) {
    let indeces = []

    for (let n = 0; n < map.length; n++) {
        
        for (let m = 0; m < map[n].length; m++) {
            if (map[n][m] == int) {
                indeces.push([n, m])
            }
        }
    }

    return indeces
}

export function trackCompletion(targetArr, utterArr, mode, lang, startInd, compArrNow) {
    
    let compArrNew = []
    let sentCompletion = []
    let targMarker = 0

    if (startInd) {
        targMarker = startInd
    }

    if (mode == 'linear') {
        utterArr.forEach(spokenWord => {
            
            if (compArrNow) {
                for (
                    targMarker;
                    targMarker < compArrNow.length
                    && !(compArrNow[targMarker] == 0);
                    targMarker++
                ) {
                    sentCompletion.push(compArrNow[targMarker])
                }
            }
            
            if (targMarker < targetArr.length) {
                if (compareWords(targetArr[targMarker], spokenWord, lang)) {
                    targMarker++
                    sentCompletion.push(1)
                }
            }
        })

        for (
            sentCompletion; 
            sentCompletion.length < targetArr.length - startInd; 
            sentCompletion.push(0)
        ) {}
    }

    if (startInd) {
        const alrComplete = compArrNow.slice(0, startInd)
        compArrNew = alrComplete.concat(sentCompletion)
    } else {
        compArrNew = sentCompletion
    }

    return [compArrNew, targMarker]
}

function skipOneWord(compArrNow, n) {
    if (compArrNow[n] == -1) {
        n++
        return n
    } else {
        return false
    }
}

export function mapToFreqs(map) {
    
    let total = 0
    let freqs = {}

    for (const arr of map) {
        total += arr.length
        
        for (const val of arr) {
            freqs[val] = freqs[val] ? freqs[val] + 1 : 1;
        }
    }
    
    return [freqs, total]
}

export function findPercent(frac, total) {
    
    let percentNum = 0
    
    if (!isNaN(frac)) {
        percentNum = 100 * frac / total
    }

    return percentNum
}