// import { oscillator } from './js/oscillate.js'

const context = new AudioContext()

const majorChord = [261.62, 329.62, 391.99, 523.33]
const minorChord = [261.62, 311.12, 391.99, 523.33]

export function oscBeep(freq, vol, length, type) {
    const oscillator = context.createOscillator()

    // type can be triangle, sine, square, or sawtooth
    oscillator.type = type
    oscillator.frequency.value = freq
    
    const gainNode = context.createGain()
    gainNode.gain.setValueAtTime(vol, context.currentTime)
    //gainNode.gain.linearRampToValueAtTime(0, context.currentTime + length)
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + length)
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()
}

export function createChord(arr, length, delay) {
    
    let thisChord = majorChord

    if (arr) {
        thisChord = arr
    }

    let n = 0;
    thisChord.forEach(val => {
        setTimeout(() => {
            oscBeep(val, 0.02, length, 'sawtooth')
        }, n * delay)

        n++
    })
}
