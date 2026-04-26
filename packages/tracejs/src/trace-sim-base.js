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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var trace_net_1 = __importDefault(require("./trace-net"));
var trace_param_1 = require("./trace-param");
var util_1 = require("./util");
var TraceSimBase = /** @class */ (function () {
    function TraceSimBase(config) {
        if (config === void 0) { config = (0, trace_param_1.createDefaultConfig)(); }
        this.config = config;
        this.inputLayer = [];
        this.featLayer = [];
        this.phonLayer = [];
        this.wordLayer = [];
        this.globalFeatureCompetition = [];
        this.globalLexicalCompetition = [];
        this.globalPhonemeCompetition = [];
        this.globalPhonToWordSum = [];
        this.globalWordToPhonSum = [];
        this.globalFeatToPhonSum = [];
        this.globalPhonToFeatSum = [];
        this.globalFeatSumAll = [];
        this.globalFeatSumPos = [];
        this.globalPhonSumAll = [];
        this.globalPhonSumPos = [];
        this.globalWordSumAll = [];
        this.globalWordSumPos = [];
        this.tn = new trace_net_1.default(this.config);
        this.phonemes = this.tn.phonemes;
        this.maxDuration = Math.max(6 * this.config.modelInput.length * this.config.deltaInput, this.config.fSlices);
    }
    TraceSimBase.prototype.getStepsRun = function () {
        return this.inputLayer.length;
    };
    TraceSimBase.prototype.cycle = function (numCycles) {
        numCycles = Math.min(this.maxDuration, numCycles);
        for (var i = 0; i < numCycles; i++) {
            this.inputLayer.push((0, util_1.copy2D)(this.tn.inputLayer));
            this.featLayer.push((0, util_1.copy2D)(this.tn.featLayer));
            this.phonLayer.push((0, util_1.copy2D)(this.tn.phonLayer));
            this.wordLayer.push((0, util_1.copy2D)(this.tn.wordLayer));
            this.globalFeatureCompetition.push(this.tn.globalFeatureCompetitionIndex);
            this.globalLexicalCompetition.push(this.tn.globalLexicalCompetitionIndex);
            this.globalPhonemeCompetition.push(this.tn.globalPhonemeCompetitionIndex);
            this.globalPhonToWordSum.push(this.tn.globalPhonToWordSum);
            this.globalWordToPhonSum.push(this.tn.globalWordToPhonSum);
            this.globalFeatToPhonSum.push(this.tn.globalFeatToPhonSum);
            this.globalPhonToFeatSum.push(this.tn.globalPhonToFeatSum);
            this.globalFeatSumAll.push(this.tn.globalFeatSumAll);
            this.globalFeatSumPos.push(this.tn.globalFeatSumPos);
            this.globalPhonSumAll.push(this.tn.globalPhonSumAll);
            this.globalPhonSumPos.push(this.tn.globalPhonSumPos);
            this.globalWordSumAll.push(this.tn.globalWordSumAll);
            this.globalWordSumPos.push(this.tn.globalWordSumPos);
            this.tn.cycle();
        }
    };
    TraceSimBase.prototype.getInputData = function (cycle) {
        return this.inputLayer[cycle].map(function (row, index) { return __spreadArray([index], row.map(function (x) { return x.toFixed(4); }), true); });
    };
    TraceSimBase.prototype.getFeatureData = function (cycle) {
        return this.featLayer[cycle].map(function (row, index) { return __spreadArray([index], row.map(function (x) { return x.toFixed(4); }), true); });
    };
    TraceSimBase.prototype.getPhonemeData = function (cycle) {
        var _this = this;
        return this.phonLayer[cycle].map(function (row, index) {
            var _a;
            return __spreadArray([
                (_this.phonemes && ((_a = _this.phonemes.byIndex(index)) === null || _a === void 0 ? void 0 : _a.label)) || '?'
            ], row.map(function (x) { return x.toFixed(4); }), true);
        });
    };
    TraceSimBase.prototype.getWordData = function (cycle) {
        var _this = this;
        return this.wordLayer[cycle].map(function (row, index) { return __spreadArray([
            _this.config.lexicon[index].phon
        ], row.map(function (x) { return x.toFixed(4); }), true); });
    };
    TraceSimBase.prototype.getLevelsAndFlowData = function (cycle) {
        return [
            [
                this.globalFeatSumAll[cycle],
                this.globalFeatSumPos[cycle],
                this.globalFeatureCompetition[cycle],
                this.globalPhonSumAll[cycle],
                this.globalPhonSumPos[cycle],
                this.globalPhonemeCompetition[cycle],
                this.globalWordSumAll[cycle],
                this.globalWordSumPos[cycle],
                this.globalLexicalCompetition[cycle],
                this.globalFeatToPhonSum[cycle],
                this.globalPhonToFeatSum[cycle],
                this.globalPhonToWordSum[cycle],
                this.globalWordToPhonSum[cycle],
            ],
        ];
    };
    TraceSimBase.prototype.getAllInputData = function () {
        var _this = this;
        return Array.from({ length: this.inputLayer.length }, function (_, k) { return _this.getInputData(k); });
    };
    TraceSimBase.prototype.getAllFeatureData = function () {
        var _this = this;
        return Array.from({ length: this.featLayer.length }, function (_, k) { return _this.getFeatureData(k); });
    };
    TraceSimBase.prototype.getAllPhonemeData = function () {
        var _this = this;
        return Array.from({ length: this.phonLayer.length }, function (_, k) { return _this.getPhonemeData(k); });
    };
    TraceSimBase.prototype.getAllWordData = function () {
        var _this = this;
        return Array.from({ length: this.wordLayer.length }, function (_, k) { return _this.getWordData(k); });
    };
    TraceSimBase.prototype.getAllLevelsAndFlowData = function () {
        var _this = this;
        return Array.from({ length: this.globalLexicalCompetition.length }, function (_, k) {
            return _this.getLevelsAndFlowData(k);
        });
    };
    TraceSimBase.prototype.serializeInputData = function (prefix) {
        var _a, _b;
        if (prefix === void 0) { prefix = []; }
        var fullPrefix = __spreadArray([this.config.modelInput], prefix, true);
        var data = this.getAllInputData();
        var numTimeSlices = ((_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) - 1 || 0;
        var timeHeaders = Array.from({ length: numTimeSlices }, function (_, i) { return "t".concat(i); }).join(', ');
        var header = "cycle, input, feature_index, ".concat(timeHeaders);
        return serializeData(data, fullPrefix, header);
    };
    TraceSimBase.prototype.serializeFeatureData = function (prefix) {
        var _a, _b;
        if (prefix === void 0) { prefix = []; }
        var fullPrefix = __spreadArray([this.config.modelInput], prefix, true);
        var data = this.getAllFeatureData();
        var numTimeSlices = ((_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) - 1 || 0;
        var timeHeaders = Array.from({ length: numTimeSlices }, function (_, i) { return "t".concat(i); }).join(', ');
        var header = "cycle, input, feature_index, ".concat(timeHeaders);
        return serializeData(data, fullPrefix, header);
    };
    TraceSimBase.prototype.serializePhonemeData = function (prefix) {
        var _a, _b;
        if (prefix === void 0) { prefix = []; }
        var fullPrefix = __spreadArray([this.config.modelInput], prefix, true);
        var data = this.getAllPhonemeData();
        var numTimeSlices = ((_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) - 1 || 0;
        var timeHeaders = Array.from({ length: numTimeSlices }, function (_, i) { return "t".concat(i); }).join(', ');
        var header = "cycle, input, phoneme, ".concat(timeHeaders);
        return serializeData(data, fullPrefix, header);
    };
    TraceSimBase.prototype.serializeWordData = function (prefix) {
        var _a, _b;
        if (prefix === void 0) { prefix = []; }
        var fullPrefix = __spreadArray([this.config.modelInput], prefix, true);
        var data = this.getAllWordData();
        var numTimeSlices = ((_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) - 1 || 0;
        var timeHeaders = Array.from({ length: numTimeSlices }, function (_, i) { return "t".concat(i); }).join(', ');
        var header = "cycle, input, word, ".concat(timeHeaders);
        return serializeData(data, fullPrefix, header);
    };
    TraceSimBase.prototype.serializeLevelsAndFlowData = function (prefix) {
        if (prefix === void 0) { prefix = []; }
        var fullPrefix = __spreadArray([this.config.modelInput], prefix, true);
        var header = 'cycle, input, feature_sum_all, feature_sum_pos, feature_competition, phon_sum_all, phon_sum_pos, phon_competition, word_sum_all, word_sum_pos, lexical_competition, feat_to_phon, phon_to_feat, phon_to_word, word_to_phon';
        return serializeData(this.getAllLevelsAndFlowData(), fullPrefix, header);
    };
    TraceSimBase.prototype.getSimData = function () {
        return {
            input: this.getAllInputData(),
            feature: this.getAllFeatureData(),
            phoneme: this.getAllPhonemeData(),
            word: this.getAllWordData(),
            levelsAndFlows: this.getAllLevelsAndFlowData(),
        };
    };
    return TraceSimBase;
}());
exports.default = TraceSimBase;
function serializeData(data, prefix, header) {
    var _a;
    var numRows = ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.length) || 0;
    var allCycles = [];
    for (var row = 0; row < numRows; row++) {
        for (var cycle = 0; cycle < data.length; cycle++) {
            allCycles.push(__spreadArray([cycle], data[cycle][row], true));
        }
    }
    // put cycle first, then prefix, then rest of row
    var csvContent = allCycles.map(function (row) { return __spreadArray(__spreadArray([row[0]], prefix, true), [row.slice(1)], false).join(', '); }).join('\n') + '\n';
    return header ? "".concat(header, "\n").concat(csvContent) : csvContent;
}
