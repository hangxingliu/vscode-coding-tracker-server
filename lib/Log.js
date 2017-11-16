//@ts-check

"use strict";
function log(t) { console.log(timePrefix(), t); }
log.success = t => console.log(timePrefix(), String(t).green);
log.warn = t =>  console.warn(timePrefix(), String(t).yellow);
log.error = t =>  console.error(timePrefix(), String(t).red);
log.info = t =>  console.log(timePrefix(), String(t).blue);
log.obj = obj => console.log(timePrefix(), 'Object info: '.blue, obj);

function timePrefix() { 
	let date = new Date();
	return `${to2(date.getHours())}:${to2(date.getMinutes())}:${to2(date.getSeconds())}`;
}
function to2(num) { return num < 10 ? `0${num}` : String(num); }

module.exports = log;
