"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gauss = exports.clamp = exports.copy2D = exports.zeros3D = exports.zeros2D = exports.average = void 0;
var average = function (array) { return array.reduce(function (a, b) { return a + b; }) / array.length; };
exports.average = average;
var zeros2D = function (rows, cols) {
    return Array.from(Array(rows), function (_) { return Array(cols).fill(0); });
};
exports.zeros2D = zeros2D;
var zeros3D = function (x, y, z) {
    return Array.from(Array(x), function (_) {
        return Array.from(Array(y), function (_) { return Array(z).fill(0); });
    });
};
exports.zeros3D = zeros3D;
var copy2D = function (arr) { return arr.map(function (x) { return __spreadArray([], x, true); }); };
exports.copy2D = copy2D;
var clamp = function (num, min, max) {
    return Math.min(Math.max(num, min), max);
};
exports.clamp = clamp;
var gauss = function (mean, sd) {
    var u = 0, v = 0;
    while (u === 0)
        u = Math.random();
    while (v === 0)
        v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * sd + mean;
};
exports.gauss = gauss;
