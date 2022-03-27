const fetch = require('node-fetch');
const url = "Paste API Here";
let hashMap = new Map();

async function startFetch() {
    await fetch(url)
    .then(res => res.text())
    .then(function(text) {
        let betOffers = JSON.parse(text).betOffers;
        let teams = [JSON.parse(text).events[0].participants[0].name, JSON.parse(text).events[0].participants[1].name];
        
        for (let i = 0; i < betOffers.length; i++) {
            //console.log(betOffers[i].criterion.englishLabel);
            switch (betOffers[i].criterion.label) {
                case "Moneyline":
                    hashMap.set("Game Moneyline", {[betOffers[i].outcomes[0].participant] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].participant] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case "Point Spread":
                    let spreadEvent = (betOffers[i].outcomes[0].line < betOffers[i].outcomes[1].line) ? (betOffers[i].outcomes[0].participant + ' ' + betOffers[i].outcomes[0].line/1000) : (betOffers[i].outcomes[1].participant + ' ' + betOffers[i].outcomes[1].line/1000);
                    hashMap.set("Game " + spreadEvent, {[betOffers[i].outcomes[0].participant] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].participant] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case "Total Points":
                    hashMap.set("Game Total " + (betOffers[i].outcomes[0].line/1000).toString(), {[betOffers[i].outcomes[0].label] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].label] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case "Tie No Bet - 1st Half":
                    hashMap.set("1st Half Moneyline", {[betOffers[i].outcomes[0].participant] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].participant] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case "Moneyline - Quarter 1":
                    hashMap.set("1st Quarter Moneyline", {[betOffers[i].outcomes[0].participant] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].participant] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case "Spread - Quarter 1":
                    let qspEvent = (betOffers[i].outcomes[0].line < betOffers[i].outcomes[1].line) ? (betOffers[i].outcomes[0].participant + ' ' + betOffers[i].outcomes[0].line/1000) : (betOffers[i].outcomes[1].participant + ' ' + betOffers[i].outcomes[1].line/1000);
                    hashMap.set("1st Quarter " + qspEvent, {[betOffers[i].outcomes[0].participant] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].participant] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case "Total Points - Quarter 1":
                    hashMap.set("1st Quarter Total " + (betOffers[i].outcomes[0].line/1000).toString(), {[betOffers[i].outcomes[0].label] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].label] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case ("Total Points by " + teams[0]):
                    hashMap.set("Game Total " + teams[0] + ' ' + (betOffers[i].outcomes[0].line/1000).toString(), {[betOffers[i].outcomes[0].label] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].label] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case ("Total Points by " + teams[1]):
                    hashMap.set("Game Total " + teams[1] + ' ' + (betOffers[i].outcomes[0].line/1000).toString(), {[betOffers[i].outcomes[0].label] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].label] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case ("Total Points by " + teams[0] + " - 1st Half"):
                    hashMap.set("1st Half " + teams[0] + " Total " + (betOffers[i].outcomes[0].line/1000).toString(), {[betOffers[i].outcomes[0].label] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].label] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                case ("Total Points by " + teams[1] + " - 1st Half"):
                    hashMap.set("1st Half " + teams[1] + " Total " + (betOffers[i].outcomes[0].line/1000).toString(), {[betOffers[i].outcomes[0].label] : parseFloat(betOffers[i].outcomes[0].oddsAmerican), [betOffers[i].outcomes[1].label] : parseFloat(betOffers[i].outcomes[1].oddsAmerican)});
                    break;
                default:
                    break;
            }
        }
        //console.log(hashMap.get("Game Total 47.5")["Over"]);
        //console.log(teams);
        hashMap = new Map([...hashMap].sort());
    });
}

async function main() {
    await startFetch();
    console.log(hashMap);
}

(async function() {
    await main();
})();