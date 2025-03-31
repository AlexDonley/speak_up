// import { urlConfigs } from './js/url-query.js'

// http://127.0.0.1:5500/index.html?teamnum=2&grid=3&vocabs=[22,23,24]&gonow=true


const defaultConfigs = {
    'fs': false,
    'lang': 'en'
}
export const urlConfigs = urlQuerToDict()

export function urlQuerToDict() {
    const query = window.location.search.substring(1);

    if (query.length > 0) {
        const vars = query.split('&');
    
        var queryDict = {};
    
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
    
            queryDict[pair[0]] = pair[1]
        }
    
        return queryDict
    } else {
        return null
    }
}

export function overwriteDefaults(querDict) {
    const defaultKeys = Object.keys(defaultConfigs)
    
    defaultKeys.forEach(key => {
        if (querDict[key]) {
            defaultConfigs[key] = querDict[key]
        }
    })
}

export function writeConfigValues(teamElem, gridElem) {
    
    if (urlConfigs) {
        overwriteDefaults(urlConfigs)
    }
    
    teamElem.value = defaultConfigs.teamnum;
    gridElem.value = defaultConfigs.grid;
}