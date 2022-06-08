import {fromEvent}  from "rxjs";
import {filter} from 'rxjs/operators';
import {getValue, run} from './interpreter';



const acorn = require("acorn");

let input = document.querySelector('#input');
let arr = [];
let tCount = 0;

const keyUps = fromEvent(input, 'keyup');
const keyDowns = fromEvent(input, 'keydown');
const keyEnter = keyUps.pipe(
    filter((e) => e.keyCode === 13)
);

keyUps.pipe(
    filter((e) => e.keyCode === 38)
    )
    .subscribe(function() {
    if (tCount >= 0 && tCount < arr.length) {
        let val = arr[tCount];
        tCount = tCount +1;
        document.querySelector('input').value = val;
    }
})

keyDowns.pipe(
    filter((e) => e.keyCode === 40)
    )
    .subscribe(function() {
        if (tCount <= arr.length && tCount > 0) {
            tCount = tCount - 1; 
            let val1 = arr[tCount];
            document.querySelector('input').value = val1;
        }
    })

keyEnter.subscribe(function () {
    let value = (event.target).value.trim();
    let eVal = "";
    if (value) {
        if (value == "clear") {
            arr.unshift(value);
            document.querySelector('input').value = "";
            return document.getElementById("output").innerHTML = "";
        }
        else if (!/(var|let|const)/.test(value)) {
            eVal = `print(${value})`;
        }
    }
    try {
        const body = acorn.parse(eVal || value).body;
        run(body);
        let result = getValue();
        const finalResult = result ? value + " = " + result : value;
        let textNode =  document.createTextNode(finalResult);
        let node = document.createElement("li");
        node.appendChild(textNode);
        document.getElementById("output").appendChild(node);
        arr.unshift(value);
        tCount=0;
    }
    catch {
        console.log("error");
    }
    document.querySelector('input').value = "";
})