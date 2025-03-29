// import { 
//      genBlankCompMap, findInt, 
//      checkMapForZero, indexIntsFromMap, 
//      trackCompletion
// } from './js/completion-map.js'

import { compareWords, removeDash } from './word-process.js'

// compound flexibility
const compFlex = 2

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
        for (let i = 0; i< utterArr.length; i++) {
            
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

                // the first check is to see if the words are identical
                if (compareWords(targetArr[targMarker], utterArr[i], lang)) {
                    
                    targMarker++;
                    sentCompletion.push(1);

                // the second check is for compound words
                // for instance, "shoemaker", "shoe-maker", and "shoe maker"
                // should all be considered the same
                } else {

                    let newTarCompound = removeDash(targetArr[targMarker]);
                    let newUttCompound = removeDash(utterArr[i]);
                    
                    let tarCompoundArr = [newTarCompound];
                    let uttCompoundArr = [newUttCompound];
                    
                    for (let j = 1; j <= compFlex; j++) {
                        if (targetArr[targMarker + j]) {
                            newTarCompound += targetArr[targMarker + j];
                            tarCompoundArr.push(newTarCompound);
                        }
                        
                        if (utterArr[i + j]) {
                            newUttCompound += utterArr[i + j];
                            uttCompoundArr.push(newUttCompound);
                        }                       

                        //console.log(tarCompoundArr, uttCompoundArr);
                    }

                    const testTarIdx = tarCompoundArr.indexOf(uttCompoundArr[0]);
                    const testUttIdx = uttCompoundArr.indexOf(tarCompoundArr[0]);
                    const uttMax = Math.floor((testUttIdx - 1) / compFlex);

                    if (testTarIdx > -1 || uttMax > -1) {
                        const newIdx = Math.max(testTarIdx, uttMax);
                        
                        //console.log(testTarIdx, uttMax, newIdx)
                        //i += newIdx;

                        for (let k = 0; k < newIdx + 1; k++) {
                            targMarker++;
                            sentCompletion.push(1);
                        }
                    }
                }
            }
        }

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