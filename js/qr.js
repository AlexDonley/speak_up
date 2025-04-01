// import { cycleQRWrap, toggleShowQR } from './js/qr.js'

const mainURL = 'alexdonley.github.io/speak_up';

let startQRsize = 1;
let showQR = 0;

export function cycleQRSize(n) {
    if (n) {
        startQRsize = n;
    } else {
        if (startQRsize < 3) {
            startQRsize++
        } else {
            startQRsize = 1
        }
    }

    switch (startQRsize) {
        case 1:
            viewQR.style.width = "min(25vh, 25vw)"
            break;
        case 2:
            viewQR.style.width = "min(33vh, 33vw)"
            break;
        case 3:
            viewQR.style.width = "min(50vh, 50vw)"
            break;
    }
}

export function cycleQRWrap() {
    return cycleQRSize()
}

export function generateNewQR(url) {
    QRCode.toDataURL(url).then(dataURL => {
        qrImg.src = dataURL;
    })
}

generateNewQR(mainURL)

export function toggleShowQR() {
    if (showQR == 0) {
        showQR = 1;
        viewQR.classList.add('show');
    } else {
        showQR = 0;
        // cycleQRSize(1);
        viewQR.classList.remove('show');
    }
}

export function genQRstr(dataDict) {
    let urlStr = mainURL + "?"
    const keysArr = Object.keys(dataDict)

    for (let i = 0; i < keysArr.length; i++) {
        const onset = keysArr[i];
        const coda = dataDict.keysArr[i];

        urlStr += onset + "=" + coda;
        
        if (!(i < keysArr.length - 1)) {
            urlStr += "&";
        }
    }

    console.log(urlStr);
    return urlStr;
}
