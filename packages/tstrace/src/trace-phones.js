"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var trace_param_1 = require("./trace-param");
var util = __importStar(require("./util"));
var TracePhones = /** @class */ (function () {
    function TracePhones(config) {
        this.config = config;
        this.ambiguousPhonemes = [];
        // create a copy of the phonemes
        this.phonemes = config.phonology.map(function (x) { return (__assign({}, x)); });
        // sort the phonemes by label
        this.sortPhonemes();
    }
    /**
     * Sorts the phonemes by the label attribute
     */
    TracePhones.prototype.sortPhonemes = function () {
        this.phonemes.sort(function (a, b) { return a.label.localeCompare(b.label); });
        for (var _i = 0, _a = this.phonemes.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], idx = _b[0], phoneme = _b[1];
            phoneme.index = idx;
        }
        this.ambiguousPhonemes.sort(function (a, b) { return a.label.localeCompare(b.label); });
        for (var _c = 0, _d = this.ambiguousPhonemes.entries(); _c < _d.length; _c++) {
            var _e = _d[_c], idx = _e[0], phoneme = _e[1];
            phoneme.index = idx;
        }
    };
    TracePhones.prototype.sorted = function () {
        return this.phonemes;
    };
    TracePhones.prototype.byIndex = function (index) {
        return this.phonemes[index];
    };
    TracePhones.prototype.byLabel = function (label) {
        return (this.phonemes.find(function (x) { return x.label == label; }) ||
            this.ambiguousPhonemes.find(function (x) { return x.label == label; }));
    };
    /**
     * Spreads the phonesmes over time according to the spread array. This
     * should be run before a TraceSim is run, and after any change to the
     * ambiguous phoneme information.
     *
     * @param spread        spread[] in TraceParam
     * @param scale         spreadScale[] in TraceParam
     * @param min           min in TraceParam
     * @param max           max in TraceParam
     */
    TracePhones.prototype.spreadPhons = function (spread, scale, min, max) {
        var _this = this;
        if (spread.length != scale.length) {
            throw new Error('spread and scale parameters have different scale');
        }
        // this appears to be how C trace is implemented.
        min = Math.max(min, 0);
        // spread offset
        var maxspread = 0;
        var computeSpreadOffset = function (phons) {
            for (var _i = 0, phons_1 = phons; _i < phons_1.length; _i++) {
                var phon = phons_1[_i];
                phon.spreadOffset = 0;
                for (var i = 0; i < spread.length; i++) {
                    var n = spread[i] * scale[i] * phon.durationScalar[0];
                    if (n > phon.spreadOffset) {
                        phon.spreadOffset = Math.ceil(n);
                    }
                    maxspread = Math.max(Math.ceil(n), maxspread);
                }
            }
        };
        computeSpreadOffset(this.phonemes);
        computeSpreadOffset(this.ambiguousPhonemes);
        // spread
        // NOTE: in the code for jTRACE, when it computes the normalization info, the ambiguous phonemes
        // calculation sets the norm value in the corresponding "phonemes" object. i.e., it adds to
        // this.phonemes[n].norm instead of this.ambiguousPhonemes[n].norm. Not sure if this is intentional
        var computeSpread = function (phons) {
            // loop over phonemes
            for (var _i = 0, phons_2 = phons; _i < phons_2.length; _i++) {
                var phon = phons_2[_i];
                phon.spread = util.zeros2D(_this.config.numFeatures * _this.config.continuaPerFeature, maxspread * 4);
                phon.norm = 0;
                // loop over continuum
                for (var cont = 0; cont < _this.config.numFeatures * _this.config.continuaPerFeature; cont++) {
                    if (phon.features[cont] > 0) {
                        var spreadSteps = Math.floor(cont / _this.config.numFeatures);
                        // delta is the amount to ramp up/down
                        var delta = (phon.features[cont] * max - phon.features[cont] * min) /
                            (spread[spreadSteps] * phon.durationScalar[0]);
                        var n = Math.floor(spread[spreadSteps] * phon.durationScalar[0]);
                        for (var i = 0; i < n; i++) {
                            // compute spread (should these be the same?)
                            phon.spread[cont][phon.spreadOffset + i] = phon.features[cont] * max - delta * i;
                            phon.spread[cont][phon.spreadOffset - i] = phon.spread[cont][phon.spreadOffset + i];
                            // and normalization info
                            phon.norm += 2 * Math.pow(phon.spread[cont][phon.spreadOffset + i], 2);
                        }
                    }
                }
            }
        };
        computeSpread(this.phonemes);
        computeSpread(this.ambiguousPhonemes);
    };
    /**
     * Create in this object a phoneme continuum of the same format as the
     * phonDefs matricies.
     * Throws an exception if arguments are unreasonable.
     * Be sure to run spreadPhons() after running this!
     *
     * @param from      one endpoint
     * @param to        the other endpoint
     * @param steps     the number of steps (2-9)
     */
    TracePhones.prototype.makePhonemeContinuum = function (from, to, steps) {
        var phon_from = this.byLabel(from);
        var phon_to = this.byLabel(to);
        if (!phon_from || !phon_to || steps <= 1 || steps > TracePhones.MAX_STEPS) {
            throw new Error('invalid arguments to makePhonemeContinuum');
        }
        var incr_phon = [];
        for (var cont = 0; cont < this.config.numFeatures * this.config.continuaPerFeature; cont++) {
            incr_phon[cont] = (phon_to.features[cont] - phon_from.features[cont]) / (steps - 1);
        }
        var incr_dur = [];
        for (var cont = 0; cont < this.config.continuaPerFeature; cont++) {
            incr_dur[cont] =
                (phon_to.durationScalar[cont] - phon_from.durationScalar[cont]) / (steps - 1);
        }
        // now create the ambiguous phoneme arrays, i.e. the data used to create the phon objects
        this.ambiguousPhonemes = [];
        for (var i = 0; i < steps; i++) {
            // loop over continuoum
            var features = [];
            for (var cont = 0; cont < this.config.numFeatures * this.config.continuaPerFeature; cont++) {
                // continuum value is calculated as ith step in cont difference between ambigFrom to ambigTo:
                features[cont] = phon_from.features[cont] + i * incr_phon[cont];
            }
            var durationScalar = [];
            for (var cont = 0; cont < this.config.continuaPerFeature; cont++) {
                // continuum value is calculated as ith step in cont difference between ambigFrom to ambigTo:
                durationScalar[cont] = phon_from.durationScalar[cont] + i * incr_dur[cont];
            }
            // create the ambiguous phoneme
            this.ambiguousPhonemes.push({
                label: i.toString(),
                features: features,
                durationScalar: durationScalar,
                phonologicalRole: trace_param_1.TracePhoneRole.AMBIG,
            });
        }
        // and add the special-purpose question mark segment:
        var midpoint = Math.floor(this.ambiguousPhonemes.length / 2);
        this.ambiguousPhonemes.push({
            label: '?',
            features: __spreadArray([], this.ambiguousPhonemes[midpoint].features, true),
            durationScalar: __spreadArray([], this.ambiguousPhonemes[midpoint].durationScalar, true),
            phonologicalRole: trace_param_1.TracePhoneRole.AMBIG,
        });
        // sort phonemes
        this.sortPhonemes();
    };
    TracePhones.MAX_STEPS = 9;
    return TracePhones;
}());
exports.default = TracePhones;
