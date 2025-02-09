// import { oscillator } from './js/oscillate.js'

const context = new AudioContext()

export function oscBeep(freq, vol, length, type) {
    console.log('starting beep')

    const oscillator = context.createOscillator()

    // type can be triangle, sine, square, or sawtooth
    oscillator.type = "square"
    oscillator.frequency.value = freq
    
    const gainNode = context.createGain()
    gainNode.gain.setValueAtTime(vol, context.currentTime)
    //gainNode.gain.linearRampToValueAtTime(0, context.currentTime + length)
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + length)
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()
}