"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonLexicon = exports.parseJsonPhonology = exports.parseJtPhonology = exports.parseJtLexicon = void 0;
/**
 * This file contains functions that import jTRACE XML files into representations that
 * TRACE.js can understand
 */
var fast_xml_parser_1 = require("fast-xml-parser");
var t = __importStar(require("typanion"));
var trace_param_1 = require("./trace-param");
var parseJtLexicon = function (xmlString) {
    var parsed = new fast_xml_parser_1.XMLParser().parse(xmlString);
    var lexeme = (parsed.lexicon && parsed.lexicon.lexeme) || [];
    return lexeme.map(function (lex) { return ({
        phon: lex.phonology,
        freq: +lex.frequency || 0,
        label: lex.label,
        prime: +lex.prime || 0,
    }); });
};
exports.parseJtLexicon = parseJtLexicon;
var parseNumberArray = function (str) {
    return str
        .trim()
        .split(' ')
        .map(function (x) { return Number(x) || 0; });
};
var parseJtPhonology = function (xmlString) {
    var _a, _b, _c, _d, _e;
    var parsed = new fast_xml_parser_1.XMLParser().parse(xmlString);
    var phoneme = (_e = (_c = (_b = (_a = parsed.phonology) === null || _a === void 0 ? void 0 : _a.phonemes) === null || _b === void 0 ? void 0 : _b.phoneme) !== null && _c !== void 0 ? _c : (_d = parsed.phonemes) === null || _d === void 0 ? void 0 : _d.phoneme) !== null && _e !== void 0 ? _e : [];
    return phoneme.map(function (phon) { return ({
        label: phon.symbol,
        features: parseNumberArray(phon.features),
        durationScalar: parseNumberArray(phon.durationScalar),
        phonologicalRole: trace_param_1.TracePhoneRole.NORMAL,
    }); });
};
exports.parseJtPhonology = parseJtPhonology;
var isPhonology = t.isArray(t.isObject({
    label: t.isString(),
    features: t.isArray(t.isNumber()),
    durationScalar: t.isArray(t.isNumber()),
    phonologicalRole: t.isOneOf([
        t.isLiteral(trace_param_1.TracePhoneRole.NORMAL),
        t.isLiteral(trace_param_1.TracePhoneRole.AMBIG),
        t.isLiteral(trace_param_1.TracePhoneRole.ALLOPHONE),
        t.isLiteral(trace_param_1.TracePhoneRole.OTHER),
    ]),
}));
var parseJsonPhonology = function (obj) {
    var errors = [];
    if (isPhonology(obj, { errors: errors })) {
        return obj;
    }
    throw Object.assign(new Error(JSON.stringify(errors)), { errors: errors });
};
exports.parseJsonPhonology = parseJsonPhonology;
var isLexicon = t.isArray(t.isObject({
    phon: t.isString(),
    freq: t.isNumber(),
    label: t.isOptional(t.isString()),
    prime: t.isNumber(),
}));
var parseJsonLexicon = function (obj) {
    var errors = [];
    if (isLexicon(obj, { errors: errors })) {
        return obj;
    }
    throw Object.assign(new Error(JSON.stringify(errors)), { errors: errors });
};
exports.parseJsonLexicon = parseJsonLexicon;
