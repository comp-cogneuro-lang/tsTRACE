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
exports.serializeJtPhonology = exports.serializeJtLexicon = void 0;
var serializeJtLexicon = function (lex) {
    return __spreadArray(__spreadArray([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<lexicon>'
    ], lex.map(function (word) { return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        '  <lexeme>'
    ], (word.label ? ["    <label>".concat(word.label, "</label>")] : []), true), [
        "    <phonology>".concat(word.phon, "</phonology>")
    ], false), (word.freq ? ["    <frequency>".concat(word.freq, "</frequency>")] : []), true), (word.prime ? ["    <prime>".concat(word.prime, "</prime>")] : []), true), [
        '  </lexeme>',
    ], false); }), true), [
        '</lexicon>',
        '',
    ], false);
};
exports.serializeJtLexicon = serializeJtLexicon;
var formatter = Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 10,
});
var serializeNumberArray = function (nums) {
    return nums.map(function (x) { return formatter.format(x); }).join(' ');
};
var serializeJtPhonology = function (phonology) {
    return __spreadArray(__spreadArray([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<phonology>',
        '  <phonemes>'
    ], phonology.map(function (phon) { return [
        '    <phoneme>',
        "      <symbol>".concat(phon.label, "</symbol>"),
        "      <features>".concat(serializeNumberArray(phon.features), "</features>"),
        "      <durationScalar>".concat(serializeNumberArray(phon.features), "</durationScalar>"),
        "    </phoneme>",
    ]; }), true), [
        '  </phonemes>',
        '</phonology>',
        '',
    ], false).join('\n');
};
exports.serializeJtPhonology = serializeJtPhonology;
