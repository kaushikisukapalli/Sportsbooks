const fetch = require('node-fetch');
const url = "Paste API Here";
let hashMap = new Map();

function decToAme(strDec) {
    let num = parseFloat(strDec.substring(0, strDec.indexOf('/')));
    let den = parseFloat(strDec.substring(strDec.indexOf('/') + 1));
    let ame = (num < den) ? (-100.0 * den / num) : (100.0 * num / den);
    // let dec = parseFloat(strDec);
    // let ame = 0.0;
    // if (dec < 2.0) {
    //     ame = -1.0 * parseFloat(100.0 / parseFloat(parseFloat(dec) - 1.0));
    // }
    // else {
    //     ame = parseFloat((parseFloat(dec) * 100.0) - 100.0);
    // }
    return ame;
}

async function startFetch() {
    await fetch(url)
    .then(res => res.text())
    .then(function(text) {
        let parts = JSON.parse(text).participants.participant;
        let teams = {[parts[0].name] : parts[0].name.substring(parts[0].name.lastIndexOf(' ') + 1), [parts[1].name] : parts[1].name.substring(parts[1].name.lastIndexOf(' ') + 1)};
        let sides = {[parts[0].type] : parts[0].name.substring(parts[0].name.lastIndexOf(' ') + 1), [parts[1].type] : parts[1].name.substring(parts[1].name.lastIndexOf(' ') + 1)};
        let markets = JSON.parse(text).markets;
        for (let i = 0; i < markets.length; i++) {
            switch (markets[i].name) {
                case "Money Line (Incl. OT)":
                case "Money Line (Excl. OT)":
                case "Money Line":
                case "MoneyLine (Incl. OT)":
                case "MoneyLine (Excl. OT)":
                case "MoneyLine":
                case "Moneyline (Incl. OT)":
                case "Moneyline (Excl. OT)":
                case "Moneyline":
                    hashMap.set("Game Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "1st Quarter Money Line":
                    hashMap.set("1st Quarter Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "2nd Quarter Money Line":
                    hashMap.set("2nd Quarter Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "3rd Quarter Money Line":
                    hashMap.set("3rd Quarter Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "4th Quarter Money Line":
                    hashMap.set("4th Quarter Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "1st Half Money Line":
                    hashMap.set("1st Half Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "2nd Half Money Line (Incl. OT)":
                case "2nd Half Money Line (Excl. OT)":
                    hashMap.set("2nd Half Moneyline", {[teams[markets[i].selection[0].name]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "Alternative Spread (Incl. OT)":
                case "Alternative Spreads (Incl. OT)":
                case "Alternative Spread (Excl. OT)":
                case "Alternative Spreads (Excl. OT)":
                    let spEvent = (markets[i].line < 0.0) ? (sides["HOME"] + ' ' + markets[i].line.toString()) : (sides["AWAY"] + ' -' + markets[i].line.toString());
                    markets[i].selection[0].name.lastIndexOf(' ')
                    hashMap.set("Game " + spEvent, {[teams[markets[i].selection[0].name.substring(0, markets[i].selection[0].name.lastIndexOf(' '))]] : decToAme(markets[i].selection[0].odds.frac), [teams[markets[i].selection[1].name.substring(0, markets[i].selection[1].name.lastIndexOf(' '))]] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case "Alternative Total Points (Incl. OT)":
                case "Alternative Total Points (Excl. OT)":
                    hashMap.set("Game Total " + markets[i].line.toString(), {[markets[i].selection[0].type] : decToAme(markets[i].selection[0].odds.frac), [markets[i].selection[1].type] : decToAme(markets[i].selection[1].odds.frac)})
                    break;
                case (parts[0].name + " Total Points (Incl. OT)"):
                case (parts[0].name + " Total Points (Excl. OT)"):
                    hashMap.set("Game " + teams[parts[0].name] + " Total " + markets[i].line.toString(), {[markets[i].selection[0].type] : decToAme(markets[i].selection[0].odds.frac), [markets[i].selection[1].type] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                case (parts[1].name + " Total Points (Incl. OT)"):
                case (parts[1].name + " Total Points (Excl. OT)"):
                    hashMap.set("Game " + teams[parts[1].name] + " Total " + markets[i].line.toString(), {[markets[i].selection[0].type] : decToAme(markets[i].selection[0].odds.frac), [markets[i].selection[1].type] : decToAme(markets[i].selection[1].odds.frac)});
                    break;
                default:
                    break;
            }
            switch(markets[i].name.substring(markets[i].name.lastIndexOf('('), markets[i].name.lastIndexOf(')'))) {
                case "(incl. overtime":
                    //console.log(markets[i].name);
                    if (markets[i].name.includes("total")) {
                        //console.log(markets[i].name);
                        let firstName = markets[i].name.substring(0, markets[i].name.indexOf(' '));
                        let lastName = markets[i].name.substring(markets[i].name.indexOf(' ')+1, markets[i].name.indexOf("total")-1);
                        if (lastName.includes("&apos;")) {
                            lastName = lastName.replace("&apos;", "'");
                        }
                        //console.log(lastName);
                        
                        // firstName = firstName.substring(0, firstName.indexOf("total")-1);
                        if (firstName.includes("&apos;")) {
                            firstName = firstName.replace("&apos;", "'");
                        }
                        let category = markets[i].name.substring(markets[i].name.lastIndexOf("total")+6, markets[i].name.lastIndexOf('(')-1);
                        let shrt = "a";
                        switch (category) {
                            case "points":
                                shrt = "Points";
                                break;
                            case "assists":
                                shrt = "Assists";
                                break;
                            case "rebounds":
                                shrt = "Rebounds";
                                break;
                            case "3-point field goals":
                                shrt = "Threes";
                                break;
                            default:
                                break;
                        }
                        let line = markets[i].name.substring(markets[i].name.lastIndexOf(')')+1);
                        let fullpProp = firstName + ' ' + lastName + ' ' + shrt + ' ' + line;
                        if (hashMap.has(fullpProp)) {
                            let oIndex = (markets[i].selection[0].type == "Over") ? 0 : 1;
                            hashMap.get(fullpProp)["Over"] = Math.max(hashMap.get(fullpProp)["Over"], decToAme(markets[i].selection[oIndex].odds.frac));
                        }
                        else {
                            hashMap.set(fullpProp, {[markets[i].selection[0].type] : decToAme(markets[i].selection[0].odds.frac), [markets[i].selection[1].type] : decToAme(markets[i].selection[1].odds.frac)});
                        }
                        
                    }
                    else {
                        let sub = markets[i].name.substring(0, markets[i].name.lastIndexOf('(')-1);
                        let longCat = sub.substring(sub.lastIndexOf(' ')+1);
                        let shortCat = "";
                        let name = "";
                        switch (longCat) {
                            case "goals":
                                shortCat = "Threes";
                                name = markets[i].name.substring(0, markets[i].name.indexOf("3-point field goals")-1);
                                break;
                            case "points":
                                shortCat = "Points";
                                name = markets[i].name.substring(0, markets[i].name.indexOf("points")-1);
                                break;
                            case "assists":
                                shortCat = "Assists";
                                name = markets[i].name.substring(0, markets[i].name.indexOf("assists")-1);
                                break;
                            case "steals":
                                shortCat = "Steals";
                                name = markets[i].name.substring(0, markets[i].name.indexOf("steals")-1);
                                break;
                            case "blocks":
                                shortCat = "Blocks";
                                name = markets[i].name.substring(0, markets[i].name.indexOf("blocks")-1);
                                break;
                            case "rebounds":
                                shortCat = "Rebounds";
                                name = markets[i].name.substring(0, markets[i].name.indexOf("rebounds")-1);
                                break;
                            default:
                                break;
                        }
                        if (name.includes("&apos;")) {
                            name = name.replace("&apos;", "'");
                        }
                        //console.log(name);
                        let pSels = markets[i].selection;
                        for (let j = 0; j < pSels.length; j++) {
                            let line = parseFloat(pSels[j].name.substring(pSels[j].name.lastIndexOf(' ')+1, pSels[j].name.lastIndexOf('+'))) - 0.5;
                            let fullpProp = name + ' ' + shortCat + ' ' + line.toString();
                            if (hashMap.has(fullpProp)) {
                                hashMap.get(fullpProp)["Over"] = Math.max(hashMap.get(fullpProp)["Over"], decToAme(pSels[j].odds.frac));
                            }
                            else {
                                hashMap.set(fullpProp, {"Over" : decToAme(pSels[j].odds.frac)});
                                //console.log(fullpProp);
                            }
                        }
                    }
                    break;
                default:
                    break;
                
            }
            //console.log(markets[i].name);
        }
        hashMap = new Map([...hashMap].sort());
    });
}

async function main() {
    await startFetch();
    // let sorted = new Map([...hashMap].sort())
    console.log(hashMap);
}

(async function() {
    await main();
})();