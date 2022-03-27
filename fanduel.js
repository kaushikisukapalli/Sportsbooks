const fetch = require('node-fetch');
const url = "Paste API Here"
let hashMap = new Map();
let teams = {};
let sides = {};
let opposites = {};

async function startFetch() {
    await fetch(url)
    .then(res => res.text())
    .then(function(text) {
        let attachments = JSON.parse(text).attachments;
        let league = attachments.competitions[Object.getOwnPropertyNames(attachments.competitions)[0]].name;
        let events = attachments.events;
        let eventId = Object.getOwnPropertyNames(events)[0];
        let awayTeam = events[eventId].name.substring(0, events[eventId].name.indexOf('@')-1);
        let homeTeam = events[eventId].name.substring(events[eventId].name.indexOf('@')+2);
        teams[awayTeam] = (league.includes("NCAA")) ? awayTeam : (awayTeam.substring(awayTeam.lastIndexOf(' ')+1));
        teams[homeTeam] = (league.includes("NCAA")) ? homeTeam : (homeTeam.substring(homeTeam.lastIndexOf(' ')+1));
        opposites[homeTeam] = teams[awayTeam];
        opposites[awayTeam] = teams[homeTeam];
        sides["Home"] = teams[homeTeam];
        sides["Away"] = teams[awayTeam];
        let markets = JSON.parse(text).attachments.markets;
        for (const property in markets) {
            //console.log(markets[property].marketName);
            switch (markets[property].marketName) {
                case "Moneyline":
                    hashMap.set("Game Moneyline", {[teams[markets[property].runners[0].runnerName]] : markets[property].runners[0].winRunnerOdds.americanDisplayOdds.americanOdds, [teams[markets[property].runners[1].runnerName]] : markets[property].runners[1].winRunnerOdds.americanDisplayOdds.americanOdds});
                    break;
                case "Alternate Spread":
                case "Alternative Spread":
                case "Alternate Spreads":
                case "Alternative Spreads":
                    let spreads = markets[property].runners;
                    for (let i = 0; i < spreads.length; i++) {
                        let spRunner = spreads[i].runnerName;
                        let handicap = parseFloat(spRunner.substring(spRunner.lastIndexOf(' ')+1));
                        let spTeam = spRunner.substring(0, spRunner.lastIndexOf(' '));
                        let aspEvent = "Game " + teams[spTeam] + " " + handicap.toString();
                        if (handicap >= 0) {
                            aspEvent = "Game " + opposites[spTeam] + " " + (-handicap).toString();
                        }
                        if (hashMap.has(aspEvent)) {
                            hashMap.get(aspEvent)[teams[spTeam]] = spreads[i].winRunnerOdds.americanDisplayOdds.americanOdds;
                        }
                        else {
                            hashMap.set(aspEvent, {[teams[spTeam]] : spreads[i].winRunnerOdds.americanDisplayOdds.americanOdds});
                        }
                    }
                    break;
                case "Spread":
                case "Spread Betting":
                    let rs = markets[property].runners;
                    let spEvent = (rs[0].handicap < rs[1].handicap) ? (teams[rs[0].runnerName] + ' ' + rs[0].handicap.toString()) : (teams[rs[1].runnerName] + ' ' + rs[1].handicap.toString());
                    hashMap.set("Game " + spEvent, {[teams[rs[0].runnerName]] : rs[0].winRunnerOdds.americanDisplayOdds.americanOdds, [teams[rs[1].runnerName]] : rs[1].winRunnerOdds.americanDisplayOdds.americanOdds});
                    break;
                case "Alternate Total Points":
                case "Alternative Total Points":    
                    let aTotals = markets[property].runners;
                    for (let i = 0; i < aTotals.length; i++) {
                        let line = aTotals[i].runnerName.substring(aTotals[i].runnerName.indexOf(' ')+1);
                        if (hashMap.has("Game Total " + line)) {
                            hashMap.get("Game Total " + line)[aTotals[i].runnerName.substring(0, aTotals[i].runnerName.indexOf(' '))] = aTotals[i].winRunnerOdds.americanDisplayOdds.americanOdds;
                        }
                        else {
                            hashMap.set("Game Total " + line, {[aTotals[i].runnerName.substring(0, aTotals[i].runnerName.indexOf(' '))] : aTotals[i].winRunnerOdds.americanDisplayOdds.americanOdds});
                        }
                    }
                    break;
                case "Home Team Total Points":
                case "Home Total Points":
                case (homeTeam + " Total Points"):
                    let hoTotals = markets[property].runners;
                    hashMap.set("Game " + sides["Home"] + " Total " + hoTotals[0].handicap.toString(), {[hoTotals[0].runnerName] : hoTotals[0].winRunnerOdds.americanDisplayOdds.americanOdds, [hoTotals[1].runnerName] : hoTotals[1].winRunnerOdds.americanDisplayOdds.americanOdds})
                    break;
                case "Away Team Total Points":
                case "Away Total Points":
                case (awayTeam + " Total Points"):
                    let awTotals = markets[property].runners;
                    hashMap.set("Game " + sides["Away"] + " Total " + awTotals[0].handicap.toString(), {[awTotals[0].runnerName] : awTotals[0].winRunnerOdds.americanDisplayOdds.americanOdds, [awTotals[1].runnerName] : awTotals[1].winRunnerOdds.americanDisplayOdds.americanOdds})
                    break;
                case ("Total Points"):
                    let total = markets[property].runners;
                    hashMap.set("Game Total " + total[0].handicap.toString(), {[total[0].runnerName] : total[0].winRunnerOdds.americanDisplayOdds.americanOdds, [total[1].runnerName] : total[1].winRunnerOdds.americanDisplayOdds.americanOdds})
                    break;
                default:
                    break;
            }
        }
        console.log(teams);
    });
}

async function main() {
    await startFetch();
    console.log(hashMap);
}

(async function() {
    await main();
})();