const fetch = require('node-fetch');
const url = "Paste API Here";
const related = "Paste API Here";
let hashMap = new Map();
let alignment = {};
let pPropIDs = {};

async function getTeams() {
    await fetch(related, {
        headers: {
            
        }    
    })
    .then(res => res.text())
    .then(function(text) {
        let teams = JSON.parse(text)[0].participants;
        alignment[teams[0].alignment] = teams[0].name.substring(teams[0].name.lastIndexOf(' ')+1);
        alignment[teams[1].alignment] = teams[1].name.substring(teams[1].name.lastIndexOf(' ')+1);
        alignment["over"] = "Over";
        alignment["under"] = "Under";
        let rArray = JSON.parse(text);
        for (let i = 0; i < rArray.length; i++) {
            if (rArray[i].hasOwnProperty("special") && rArray[i].special.hasOwnProperty("category") && rArray[i].special.category == "Player Props") {
                let pName = rArray[i].special.description.substring(0, rArray[i].special.description.indexOf('(')-1);
                let category = rArray[i].special.description.substring(rArray[i].special.description.indexOf('(')+1, rArray[i].special.description.indexOf(')'));
                //console.log(pName + ' ' + catetory);
                if (category == "3 Point FG") {
                    category = "Threes";
                }
                pPropIDs[rArray[i].id] = pName + ' ' + category;
                pPropIDs[rArray[i].participants[0].id] = rArray[i].participants[0].name;
                pPropIDs[rArray[i].participants[1].id] = rArray[i].participants[1].name;
            }
        }
    });
}

async function startFetch() {
    await getTeams();
    await fetch(url, {
        headers: {
            
        }    
})
.then(res => res.text())
.then(function(text) {
    let markets = JSON.parse(text);
    for (let i = 0; i < markets.length; i++) {
        if (markets[i].hasOwnProperty("isAlternate")) {
            let period = "";
            switch (markets[i].key.charAt(2)) {
                case '0':
                    period = "Game";
                    break;
                case '1':
                    period = "1st Half";
                    break;
                case '3':
                    period = "1st Quarter";
                    break;
                default:
                    break;
            }
            let market = "";
            switch (markets[i].key.charAt(4)) {
                case 'm':
                    market = "Moneyline";
                    break;
                case 's':
                    market = (markets[i].prices[0].points < markets[i].prices[1].points) ? (alignment[markets[i].prices[0].designation] + " " + markets[i].prices[0].points.toString()) : (alignment[markets[i].prices[1].designation] + " " + markets[i].prices[1].points.toString());
                    break;
                case 'o':
                    market = "Total " + markets[i].prices[0].points.toString();
                    break;
                case 't':
                    market = alignment[markets[i].side] + " Total " + markets[i].prices[0].points.toString();
                    break;
                default:
                    break;
            }
            hashMap.set(period + " " + market, {[alignment[markets[i].prices[0].designation]] : markets[i].prices[0].price, [alignment[markets[i].prices[1].designation]] : markets[i].prices[1].price});
        }
        // console.log(markets[i].matchupId);
        console.log(pPropIDs[markets[i].matchupId]);
        if (pPropIDs.hasOwnProperty(markets[i].matchupId)) {
            console.log(pPropIDs[markets[i].matchupId])
            hashMap.set(pPropIDs[markets[i].matchupId] + ' ' + markets[i].prices[0].points.toString(), {[pPropIDs[markets[i].prices[0].participantId]] : markets[i].prices[0].price, [pPropIDs[markets[i].prices[1].participantId]] : markets[i].prices[1].price});
        }
        //console.log((markets[77]));
    }
});}

async function main() {
    await startFetch();
    console.log(hashMap);
    //console.log(alignment);
}

(async function() {
    await main();
})();