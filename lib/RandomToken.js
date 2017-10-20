
"use strict";
const CHARS = "23456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
	CHARS_LENGTH = CHARS.length;
const TOKEN_LENGTH = 8;
function gen() {
	var token = "",
		i = TOKEN_LENGTH;
	while (i--)
		token+= CHARS[Math.floor(Math.random() * CHARS_LENGTH)];
    return token;
}

module.exports = { gen };