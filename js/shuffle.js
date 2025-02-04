// import { shuffle } from './shuffle.js'

// SHUFFLER SNIP
// takes an unshuffled array and returns a shuffled array

export function shuffle(arr){
    const unshuffled = arr;
    let shuffled = [];

    // every item in the unshuffled list is inserted 
    // at a random possible position in the shuffled list

    unshuffled.forEach(word =>{
        const randomPos = Math.round(Math.random() * shuffled.length);
        shuffled.splice(randomPos, 0, word);
    })
    
    return shuffled;
}