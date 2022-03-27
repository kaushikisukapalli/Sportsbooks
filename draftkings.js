const fetch = require('node-fetch');
const url = "Paste API Here";


let hashMap = new Map();

async function startFetch() {
    await fetch(url)
    .then(res => res.text())
    .then(function(text) {
        let eventCategories = JSON.parse(text).eventCategories;
        let gameLines = eventCategories[0].componentizedOffers[0].offers[0];
        let teamName1 = JSON.parse(text).event.teamName1;
        let shortName1 = (JSON.parse(text).event.eventGroupName.includes("College")) ? teamName1 : teamName1.substring(teamName1.lastIndexOf(' ')+1);
        let teamName2 = JSON.parse(text).event.teamName2;
        let shortName2 = (JSON.parse(text).event.eventGroupName.includes("College")) ? teamName2 : teamName2.substring(teamName2.lastIndexOf(' ')+1);
        let teams = {[teamName1] : shortName1, [teamName2] : shortName2};
        let opposites = {[teamName1] : shortName2, [teamName2] : shortName1};
        hashMap.set("Game Moneyline", {[teams[gameLines[2].outcomes[0].label]] : parseFloat(gameLines[2].outcomes[0].oddsAmerican), [teams[gameLines[2].outcomes[1].label]] : parseFloat(gameLines[2].outcomes[1].oddsAmerican)});
        hashMap.set("Game Total " + [gameLines[1].outcomes[0].line.toString()], {[gameLines[1].outcomes[0].label] : parseFloat(gameLines[1].outcomes[0].oddsAmerican), [gameLines[1].outcomes[1].label] : parseFloat(gameLines[1].outcomes[1].oddsAmerican)});
        let defaultSpread = (gameLines[0].outcomes[0].line < gameLines[0].outcomes[1].line) ? teams[gameLines[0].outcomes[0].label] + ' ' + gameLines[0].outcomes[0].line.toString() : teams[gameLines[0].outcomes[1].label] + ' ' + gameLines[0].outcomes[1].line.toString();
        hashMap.set("Game " + defaultSpread, {[teams[gameLines[0].outcomes[0].label]] : parseFloat(gameLines[0].outcomes[0].oddsAmerican), [teams[gameLines[0].outcomes[1].label]] : parseFloat(gameLines[0].outcomes[1].oddsAmerican)});
        // let totals = JSON.parse(text).eventCategories[1].componentizedOffers[2].offers[0][0].outcomes;
        // for (var i = 0; i < totals.length; i += 2) {
        //     let totalEvent = "Game Total " + [totals[i].line.toString()];
        //     hashMap.set(totalEvent, {[totals[i].label] : parseFloat(totals[i].oddsAmerican), [totals[i+1].label] : parseFloat(totals[i+1].oddsAmerican)});
        // }
        // let spreads = JSON.parse(text).eventCategories[1].componentizedOffers[1].offers[0][0].outcomes;
        // for (let i = 0; i < spreads.length; i += 2) {
        //     let spreadEvent = (spreads[i].line < spreads[i+1].line) ? [teams[spreads[i].label]] + ' ' + spreads[i].line.toString() : [teams[spreads[i+1].label]] + ' ' + spreads[i+1].line.toString();
        //     hashMap.set("Game " + spreadEvent, {[spreads[i].label.substring(spreads[i].label.indexOf(' ')+1)] : parseFloat(spreads[i].oddsAmerican), [spreads[i+1].label.substring(spreads[i+1].label.indexOf(' ')+1)] : parseFloat(spreads[i+1].oddsAmerican)})
        // }
        let found = false;
        let k = 0;
        while (k < eventCategories.length && !found) {
            if (eventCategories[k].name == "Game Lines") {
                found = true;
            }
            else {
                k++;
            }
        }
        let altLines = found ? eventCategories[k].componentizedOffers : []
        for (let i = 0; found && i < altLines.length; i++) {
            switch (altLines[i].subcategoryName) {
                case "Alternate Total":
                    let totals = altLines[i].offers[0][0].outcomes;
                    for (let j = 0; j < totals.length; j++) {
                        if (hashMap.has("Game Total " + totals[j].line.toString())) {
                            hashMap.get("Game Total " + totals[j].line.toString())[totals[j].label] = parseFloat(totals[j].oddsAmerican);
                        }
                        else {
                            hashMap.set("Game Total " + totals[j].line.toString(), {[totals[j].label] : parseFloat(totals[j].oddsAmerican)});
                        }
                    }
                    break;
                case "Alternate Spread":
                    let spreads = altLines[i].offers[0][0].outcomes;
                    for (let j = 0; j < spreads.length; j++) {
                        let spreadEvent = (spreads[j].line < 0) ? (teams[spreads[j].label] + " " + spreads[j].line.toString()) : (opposites[spreads[j].label] + " " + (-spreads[j].line).toString());
                        if (hashMap.has(spreadEvent)) {
                            hashMap.get(spreadEvent)[teams[spreads[j].label]] = parseFloat(spreads[j].oddsAmerican);
                        }
                        else {
                            hashMap.set(spreadEvent, {[teams[spreads[j].label]] : parseFloat(spreads[j].oddsAmerican)});
                        }
                    }
                    break;
                default:
                    break
            }
        }
        found = false;
        k = 0;
        while (k < eventCategories.length && !found) {
            if (eventCategories[k].name == "Halves") {
                found = true;
            }
            else {
                k++;
            }
        }
        let halves = found ? eventCategories[k].componentizedOffers : [];
        for (let i = 0; found && i < halves.length; i++) {
            switch (halves[i].subcategoryName) {
                case "1st Half":
                    for (let j = 0; j < halves[i].offers[0].length; j++) {
                        switch (halves[i].offers[0][j].label) {
                            case "Spread 1st Half":
                                let firsthalfspreadevent = (halves[i].offers[0][j].outcomes[0].line < halves[i].offers[0][j].outcomes[1].line) ? teams[halves[i].offers[0][j].outcomes[0].label] + ' ' + halves[i].offers[0][j].outcomes[0].line.toString() : teams[halves[i].offers[0][j].outcomes[1].label] + ' ' + halves[i].offers[0][j].outcomes[1].line.toString();
                                hashMap.set("1st Half " + firsthalfspreadevent, {[teams[halves[i].offers[0][j].outcomes[0].label]] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [teams[halves[i].offers[0][j].outcomes[1].label]] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                                break;
                            case "Total 1st Half":
                                hashMap.set("1st Half Total " + halves[i].offers[0][j].outcomes[0].line.toString(), {[halves[i].offers[0][j].outcomes[0].label] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [halves[i].offers[0][j].outcomes[1].label] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                                break;
                            default:
                                hashMap.set("1st Half Moneyline", {[teams[halves[i].offers[0][j].outcomes[0].label]] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [teams[halves[i].offers[0][j].outcomes[1].label]] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                                break;
                        }
                    }
                    break;
                case "2nd Half":
                    for (let j = 0; j < halves[i].offers[0].length; j++)
                    switch (halves[i].offers[0][j].label) {
                        case "Spread 2nd Half":
                            let firsthalfspreadevent = (halves[i].offers[0][j].outcomes[0].line < halves[i].offers[0][j].outcomes[1].line) ? teams[halves[i].offers[0][j].outcomes[0].label] + ' ' + halves[i].offers[0][j].outcomes[0].line.toString() : teams[halves[i].offers[0][j].outcomes[1].label] + ' ' + halves[i].offers[0][j].outcomes[1].line.toString();
                            hashMap.set("2nd Half " + firsthalfspreadevent, {[teams[halves[i].offers[0][j].outcomes[0].label]] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [teams[halves[i].offers[0][j].outcomes[1].label]] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        case "Total 2nd Half":
                            hashMap.set("2nd Half Total " + halves[i].offers[0][j].outcomes[0].line.toString(), {[halves[i].offers[0][j].outcomes[0].label] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [halves[i].offers[0][j].outcomes[1].label] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        default:
                            hashMap.set("2nd Half Moneyline", {[teams[halves[i].offers[0][j].outcomes[0].label]] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [teams[halves[i].offers[0][j].outcomes[1].label]] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                    }
                    break;
                case "Alternate Spread":
                    for (let j = 0; j < halves[i].offers[0][0].outcomes.length; j += 2) {
                        let spEvent = (halves[i].offers[0][0].outcomes[j].line < halves[i].offers[0][0].outcomes[j+1].line) ? teams[halves[i].offers[0][0].outcomes[j].label] + ' ' + halves[i].offers[0][0].outcomes[j].line.toString() : teams[halves[i].offers[0][0].outcomes[j+1].label] + ' ' + halves[i].offers[0][0].outcomes[j+1].line.toString();
                        hashMap.set("1st Half " + spEvent, {[teams[halves[i].offers[0][0].outcomes[j].label]] : parseFloat(halves[i].offers[0][0].outcomes[j].oddsAmerican), [teams[halves[i].offers[0][0].outcomes[j+1].label]] : parseFloat(halves[i].offers[0][0].outcomes[j+1].oddsAmerican)});
                    }
                    break;
                case "Alternate Total":
                    for (let j = 0; j < halves[i].offers[0][0].outcomes.length; j += 2) {
                        hashMap.set("1st Half Total " + halves[i].offers[0][0].outcomes[j].line.toString(), {[halves[i].offers[0][0].outcomes[j].label] : parseFloat(halves[i].offers[0][0].outcomes[j].oddsAmerican), [halves[i].offers[0][0].outcomes[j+1].label] : parseFloat(halves[i].offers[0][0].outcomes[j+1].oddsAmerican)});
                    }
                    break;
                case "Team Totals- Halves":
                    for (let j = 0; j < halves[i].offers[0].length; j++) {
                        let teamName = teams[halves[i].offers[0][j].label.substring(0, halves[i].offers[0][j].label.indexOf(':'))];
                        let period = halves[i].offers[0][j].label.substring(halves[i].offers[0][j].label.lastIndexOf('-') + 2);
                        hashMap.set(period + ' ' + teamName + " Total " + halves[i].offers[0][j].outcomes[0].line.toString(), {[halves[i].offers[0][j].outcomes[0].label] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [halves[i].offers[0][j].outcomes[1].label] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                    }
                    break;
                case "Team Totals":
                    for (let j = 0; j < halves[i].offers[0].length; j++) {
                        let teamName = teams[halves[i].offers[0][j].label.substring(0, halves[i].offers[0][j].label.indexOf(':'))];
                        let period = halves[i].offers[0][j].label.substring(halves[i].offers[0][j].label.lastIndexOf('-') + 2);
                        hashMap.set(period + ' ' + teamName + " Total " + halves[i].offers[0][j].outcomes[0].line.toString(), {[halves[i].offers[0][j].outcomes[0].label] : parseFloat(halves[i].offers[0][j].outcomes[0].oddsAmerican), [halves[i].offers[0][j].outcomes[1].label] : parseFloat(halves[i].offers[0][j].outcomes[1].oddsAmerican)});
                    }
                    break;
                default:
                    break;
            }
        }
        found = false;
        k = 0;
        while (k < eventCategories.length && !found) {
            if (eventCategories[k].name == "Quarters") {
                found = true;
            }
            else {
                k++;
            }
        }
        let quarters = found ? eventCategories[k].componentizedOffers : [];
        for (let i = 0; found && i < quarters.length; i++) {
            switch (quarters[i].subcategoryName) {
                case "1st Quarter":
                    for (let j = 0; j < quarters[i].offers[0].length; j++) {
                        switch (quarters[i].offers[0][j].label) {
                            case "Spread 1st Quarter":
                                let firstqtrspreadevent = (quarters[i].offers[0][j].outcomes[0].line < quarters[i].offers[0][j].outcomes[1].line) ? teams[quarters[i].offers[0][j].outcomes[0].label] + ' ' + quarters[i].offers[0][j].outcomes[0].line.toString() : teams[quarters[i].offers[0][j].outcomes[1].label] + ' ' + quarters[i].offers[0][j].outcomes[1].line.toString();
                                hashMap.set("1st Quarter " + firstqtrspreadevent, {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                                break;
                            case "Total 1st Quarter":
                                hashMap.set("1st Quarter Total " + quarters[i].offers[0][j].outcomes[0].line.toString(), {[quarters[i].offers[0][j].outcomes[0].label] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [quarters[i].offers[0][j].outcomes[1].label] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                                break;
                            default:
                                hashMap.set("1st Quarter Moneyline", {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                                break;
                        }
                    }
                    break;
                case "2nd Quarter":
                    for (let j = 0; j < quarters[i].offers[0].length; j++)
                    switch (quarters[i].offers[0][j].label) {
                        case "Spread 2nd Quarter":
                            let secondqtrspreadevent = (quarters[i].offers[0][j].outcomes[0].line < quarters[i].offers[0][j].outcomes[1].line) ? teams[quarters[i].offers[0][j].outcomes[0].label] + ' ' + quarters[i].offers[0][j].outcomes[0].line.toString() : teams[quarters[i].offers[0][j].outcomes[1].label] + ' ' + quarters[i].offers[0][j].outcomes[1].line.toString();
                            hashMap.set("2nd Quarter " + secondqtrspreadevent, {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        case "Total 2nd Quarter":
                            hashMap.set("2nd Quarter Total " + quarters[i].offers[0][j].outcomes[0].line.toString(), {[quarters[i].offers[0][j].outcomes[0].label] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [quarters[i].offers[0][j].outcomes[1].label] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        default:
                            hashMap.set("2nd Quarter Moneyline", {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                    }
                    break;
                case "3rd Quarter":
                    for (let j = 0; j < quarters[i].offers[0].length; j++)
                    switch (quarters[i].offers[0][j].label) {
                        case "Spread 3rd Quarter":
                            let thirdqtrspreadevent = (quarters[i].offers[0][j].outcomes[0].line < quarters[i].offers[0][j].outcomes[1].line) ? teams[quarters[i].offers[0][j].outcomes[0].label] + ' ' + quarters[i].offers[0][j].outcomes[0].line.toString() : teams[quarters[i].offers[0][j].outcomes[1].label] + ' ' + quarters[i].offers[0][j].outcomes[1].line.toString();
                            hashMap.set("3rd Quarter " + thirdqtrspreadevent, {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        case "Total 3rd Quarter":
                            hashMap.set("3rd Quarter Total " + quarters[i].offers[0][j].outcomes[0].line.toString(), {[quarters[i].offers[0][j].outcomes[0].label] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [quarters[i].offers[0][j].outcomes[1].label] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        default:
                            hashMap.set("3rd Quarter Moneyline", {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                    }
                    break;
                case "4th Quarter":
                    for (let j = 0; j < quarters[i].offers[0].length; j++)
                    switch (quarters[i].offers[0][j].label) {
                        case "Spread 4th Quarter":
                            let fourthqtrspreadevent = (quarters[i].offers[0][j].outcomes[0].line < quarters[i].offers[0][j].outcomes[1].line) ? teams[quarters[i].offers[0][j].outcomes[0].label] + ' ' + quarters[i].offers[0][j].outcomes[0].line.toString() : teams[quarters[i].offers[0][j].outcomes[1].label] + ' ' + quarters[i].offers[0][j].outcomes[1].line.toString();
                            hashMap.set("4th Quarter " + fourthqtrspreadevent, {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        case "Total 4th Quarter":
                            hashMap.set("4th Quarter Total " + quarters[i].offers[0][j].outcomes[0].line.toString(), {[quarters[i].offers[0][j].outcomes[0].label] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [quarters[i].offers[0][j].outcomes[1].label] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                        default:
                            hashMap.set("4th Quarter Moneyline", {[teams[quarters[i].offers[0][j].outcomes[0].label]] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [teams[quarters[i].offers[0][j].outcomes[1].label]] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                            break;
                    }
                    break;
                case "Alternate Spread":
                    for (let j = 0; j < quarters[i].offers[0][0].outcomes.length; j += 2) {
                        let spEvent = (quarters[i].offers[0][0].outcomes[j].line < quarters[i].offers[0][0].outcomes[j+1].line) ? teams[quarters[i].offers[0][0].outcomes[j].label] + ' ' + quarters[i].offers[0][0].outcomes[j].line.toString() : teams[quarters[i].offers[0][0].outcomes[j+1].label] + ' ' + quarters[i].offers[0][0].outcomes[j+1].line.toString();
                        hashMap.set("1st Quarter " + spEvent, {[teams[quarters[i].offers[0][0].outcomes[j].label]] : parseFloat(quarters[i].offers[0][0].outcomes[j].oddsAmerican), [teams[quarters[i].offers[0][0].outcomes[j+1].label]] : parseFloat(quarters[i].offers[0][0].outcomes[j+1].oddsAmerican)});
                    }
                    break;
                case "Alternate Total":
                    for (let j = 0; j < quarters[i].offers[0][0].outcomes.length; j += 2) {
                        hashMap.set("1st Quarter Total " + quarters[i].offers[0][0].outcomes[j].line.toString(), {[quarters[i].offers[0][0].outcomes[j].label] : parseFloat(quarters[i].offers[0][0].outcomes[j].oddsAmerican), [quarters[i].offers[0][0].outcomes[j+1].label] : parseFloat(quarters[i].offers[0][0].outcomes[j+1].oddsAmerican)});
                    }
                    break;
                case "Team Totals":
                    for (let j = 0; j < quarters[i].offers[0].length; j++) {
                        let teamName = teams[quarters[i].offers[0][j].label.substring(0, quarters[i].offers[0][j].label.indexOf(':'))];
                        let period = quarters[i].offers[0][j].label.substring(quarters[i].offers[0][j].label.lastIndexOf('-') + 2);
                        hashMap.set(period + ' ' + teamName + " Total " + quarters[i].offers[0][j].outcomes[0].line.toString(), {[quarters[i].offers[0][j].outcomes[0].label] : parseFloat(quarters[i].offers[0][j].outcomes[0].oddsAmerican), [quarters[i].offers[0][j].outcomes[1].label] : parseFloat(quarters[i].offers[0][j].outcomes[1].oddsAmerican)});
                    }
                    break;
                default:
                    break;
            }
        }
        found = false;
        k = 0;
        while (k < eventCategories.length && !found) {
            if (eventCategories[k].name == "Game Props") {
                found = true;
            }
            else {
                k++;
            }
        }
        let gProps = found ? eventCategories[k].componentizedOffers : [];
        for (let i = 0; found && i < gProps.length; i++) {
            switch (gProps[i].subcategoryName) {
                case "Team Totals":
                    for (let j = 0; j < gProps[i].offers[0].length; j++) {
                        if (gProps[i].offers[0][j].label.includes("Points")) {
                            let tName = teams[gProps[i].offers[0][j].label.substring(0, gProps[i].offers[0][j].label.indexOf(':'))];
                            hashMap.set("Game " + tName + " Total " + gProps[i].offers[0][j].outcomes[0].line.toString(), {[gProps[i].offers[0][j].outcomes[0].label] : parseFloat(gProps[i].offers[0][j].outcomes[0].oddsAmerican), [gProps[i].offers[0][j].outcomes[1].label] : parseFloat(gProps[i].offers[0][j].outcomes[1].oddsAmerican)});
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        found = false;
        k = 0;
        while (k < eventCategories.length && !found) {
            if (eventCategories[k].name == "Player Props") {
                found = true;
            }
            else {
                k++;
            }
        }
        let pProps = found ? eventCategories[k].componentizedOffers : [];
        for (let i = 0; found && i < pProps.length; i++) {
            switch (pProps[i].subcategoryName) {
                case "Points":
                case "Assists":
                case "Rebounds":
                case "Steals":
                case "Blocks":
                    for (let j = 0; j < pProps[i].offers[0].length; j++) {
                        hashMap.set(pProps[i].offers[0][j].label + ' ' + pProps[i].offers[0][j].outcomes[0].line.toString(), {[pProps[i].offers[0][j].outcomes[0].label] : parseFloat(pProps[i].offers[0][j].outcomes[0].oddsAmerican), [pProps[i].offers[0][j].outcomes[1].label] : parseFloat(pProps[i].offers[0][j].outcomes[1].oddsAmerican)});
                    }
                    break;
                case "Threes":
                    for (let j = 0; j < pProps[i].offers[0].length; j++) {
                        let pTEvent = pProps[i].offers[0][j].label;
                        hashMap.set(pTEvent.substring(0, pTEvent.lastIndexOf("Three Pointers Made")) + "Threes " + pProps[i].offers[0][j].outcomes[0].line.toString(), {[pProps[i].offers[0][j].outcomes[0].label] : parseFloat(pProps[i].offers[0][j].outcomes[0].oddsAmerican), [pProps[i].offers[0][j].outcomes[1].label] : parseFloat(pProps[i].offers[0][j].outcomes[1].oddsAmerican)});
                    }
                    break;
                default:
                    break;
            }
        }
        while (k < eventCategories.length && !found) {
            if (eventCategories[k].name == "Passing Props") {
                found = true;
            }
            else {
                k++;
            }
        }
        let passProps = found ? eventCategories[k].componentizedOffers : [];
        for (let i = 0; found && i < passProps.length; i++) {
            switch (passProps[i].subcategoryName) {
                case "Pass Yds":
                    for (let j = 0; j < passProps[i].offers[0].length; j++) {
                        hashMap.set(passProps[i].offers[0][j].label + ' ' + passProps[i].offers[0][j].outcomes[0].line.toString(), {[passProps[i].offers[0][j].outcomes[0].label] : parseFloat(passProps[i].offers[0][j].outcomes[0].oddsAmerican), [passProps[i].offers[0][j].outcomes[1].label] : parseFloat(passProps[i].offers[0][j].outcomes[1].oddsAmerican)});
                    }
                    break;
                default:
                    break;
            }
        }
        //console.log(teams);
    });
}

async function main() {
    await startFetch();
    console.log(hashMap);
    //console.log("College Football".includes("College"));
}

(async function() {
    await main();
})();