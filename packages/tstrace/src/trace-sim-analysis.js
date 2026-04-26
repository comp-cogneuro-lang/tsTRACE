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
exports.formatAnalysis = exports.getAnalysisData = exports.doSimAnalysis = exports.TraceCompetitionType = exports.TraceChoice = exports.TraceCalculationType = exports.TraceContentType = exports.TraceDomain = void 0;
var response_probability_1 = require("./response-probability");
var util = __importStar(require("./util"));
/** are we watching phonemes or words? */
var TraceDomain;
(function (TraceDomain) {
    TraceDomain[TraceDomain["PHONEMES"] = 0] = "PHONEMES";
    TraceDomain[TraceDomain["WORDS"] = 1] = "WORDS";
})(TraceDomain || (exports.TraceDomain = TraceDomain = {}));
/** graph contents */
var TraceContentType;
(function (TraceContentType) {
    TraceContentType[TraceContentType["RESPONSE_PROBABILITIES"] = 0] = "RESPONSE_PROBABILITIES";
    TraceContentType[TraceContentType["ACTIVATIONS"] = 1] = "ACTIVATIONS";
    TraceContentType[TraceContentType["COMPETITION_INDEX"] = 2] = "COMPETITION_INDEX";
})(TraceContentType || (exports.TraceContentType = TraceContentType = {}));
/** how alignment works */
var TraceCalculationType;
(function (TraceCalculationType) {
    TraceCalculationType[TraceCalculationType["AVERAGE"] = 0] = "AVERAGE";
    TraceCalculationType[TraceCalculationType["MAX_POSTHOC"] = 1] = "MAX_POSTHOC";
    TraceCalculationType[TraceCalculationType["STATIC"] = 2] = "STATIC";
    TraceCalculationType[TraceCalculationType["FRAUENFELDER"] = 3] = "FRAUENFELDER";
    TraceCalculationType[TraceCalculationType["MAX_ADHOC"] = 4] = "MAX_ADHOC";
    TraceCalculationType[TraceCalculationType["MAX_ADHOC_2"] = 5] = "MAX_ADHOC_2";
})(TraceCalculationType || (exports.TraceCalculationType = TraceCalculationType = {}));
/** how choice works */
var TraceChoice;
(function (TraceChoice) {
    TraceChoice[TraceChoice["NORMAL"] = 0] = "NORMAL";
    TraceChoice[TraceChoice["FORCED"] = 1] = "FORCED";
})(TraceChoice || (exports.TraceChoice = TraceChoice = {}));
var TraceCompetitionType;
(function (TraceCompetitionType) {
    TraceCompetitionType[TraceCompetitionType["RAW"] = 0] = "RAW";
    TraceCompetitionType[TraceCompetitionType["FIRST_DERIVATIVE"] = 1] = "FIRST_DERIVATIVE";
    TraceCompetitionType[TraceCompetitionType["SECOND_DERIVATIVE"] = 2] = "SECOND_DERIVATIVE";
})(TraceCompetitionType || (exports.TraceCompetitionType = TraceCompetitionType = {}));
/**
 * Get indices into the second arg for items that match an element in the
 * first arg.
 */
var itemsToArrayIndices = function (items, compare) {
    var result = [];
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        for (var idx = 0; idx < compare.length; idx++) {
            if (item == compare[idx]) {
                result.push(idx);
            }
        }
    }
    return result;
};
var averagingOp = function (data, midIndex, width) {
    var res = 0;
    var tick = 0;
    for (var i = midIndex - Math.floor(width / 2); i < midIndex + Math.floor(width / 2); i++) {
        if (i < 0)
            continue;
        if (i >= data.length)
            break;
        res += data[i];
        tick++;
    }
    res /= tick;
    return res;
};
var makeXAxis = function (len) {
    var res = [];
    for (var i = 1; i <= len + 1; i++) {
        res[i - 1] = i;
    }
    return res;
};
var slopeRegress = function (dat, width, length) {
    /*
     * to do the regression line, for the compet slope stuff, use:
     * b = SUM[(x-avg(x))(y-avg(y))] / SUM[(x-avg(x))^2]
     **/
    var deriv = [];
    var xAxis = makeXAxis(length);
    for (var iCI = 0; iCI < length - 1; iCI++) {
        var sumxyCI = 0, sumxxCI = 0;
        var idxCI = //tickCI=0;
         void 0; //tickCI=0;
        for (var jCI = Math.floor(-width / 2); jCI < width / 2 && jCI < dat.length; jCI++) {
            idxCI = iCI + jCI;
            if (idxCI < 0)
                continue;
            if (idxCI >= xAxis.length)
                break;
            sumxyCI +=
                (xAxis[idxCI] - averagingOp(xAxis, iCI, width)) *
                    (dat[idxCI] - averagingOp(dat, iCI, width));
            sumxxCI +=
                (xAxis[idxCI] - averagingOp(xAxis, iCI, width)) *
                    (xAxis[idxCI] - averagingOp(xAxis, iCI, width));
        }
        //System.out.println(iCI+"\tb="+(sumxyCI/sumxxCI)+" = "+sumxyCI+" / "+sumxxCI+" ["+dat[iCI]+"]");
        deriv[iCI] = sumxyCI / sumxxCI;
    }
    return deriv;
};
var discoverItemsToWatch = function (config) {
    var itemsToWatch = config.domain == TraceDomain.WORDS
        ? config.sim.config.lexicon.map(function (x) { return x.phon; })
        : config.sim.phonemes.sorted().map(function (x) { return x.label; });
    var filteredItems = config.excludeSilence
        ? itemsToWatch.filter(function (phon) { return !/^-+$/.test(phon); })
        : itemsToWatch;
    var datasets = (0, exports.doSimAnalysis)(__assign(__assign({}, config), { itemsToWatch: filteredItems }));
    return datasets
        .map(function (dataset, index) { return [dataset, filteredItems[index]]; }) // zip dataset and itemsToWatch
        .sort(function (_a, _b) {
        var a = _a[0];
        var b = _b[0];
        return Math.max.apply(Math, b.data.map(function (point) { return point.y; })) - Math.max.apply(Math, a.data.map(function (point) { return point.y; }));
    }) // sort desc by max Y value
        .slice(0, +config.itemsToWatch) // take top N values
        .map(function (_a) {
        var _ = _a[0], itemToWatch = _a[1];
        return itemToWatch;
    }); // return the filteredItems value
};
/**
 * Creates a new instance of TraceAnalysis.
 * @param sim             TraceSim object
 * @param domain          PHONEMES or WORDS
 * @param watchType
 * @param itemsToWatch    items to watch (Vector of chars, Vector of TraceWords, or null)
 * @param watchTopN       0 to use items, or otherwise N
 * @param calculationType AVERAGE, MAX_ADHOC, MAX_ADHOC2, MAX_POSTHOC, STATIC, or FRAUNFELDER
 * @param alignment       if alignment == STATIC
 * @param choice          NORMAL or FORCED
 * @param kValue          LCR exponent (if 0, use activations)
 */
var doSimAnalysis = function (config) {
    var sim = config.sim, _a = config.domain, domain = _a === void 0 ? TraceDomain.WORDS : _a, _b = config.itemsToWatch, itemsToWatch = _b === void 0 ? 10 : _b, _c = config.calculationType, calculationType = _c === void 0 ? TraceCalculationType.STATIC : _c, _d = config.alignment, alignment = _d === void 0 ? 4 : _d, _e = config.choice, choice = _e === void 0 ? TraceChoice.NORMAL : _e, _f = config.kValue, kValue = _f === void 0 ? 4 : _f, _g = config.competType, competType = _g === void 0 ? TraceCompetitionType.RAW : _g, _h = config.competSlope, competSlope = _h === void 0 ? 1 : _h;
    var contentType;
    if (kValue < 0) {
        contentType = TraceContentType.COMPETITION_INDEX;
    }
    else if (kValue === 0) {
        contentType = TraceContentType.ACTIVATIONS;
    }
    else {
        contentType = TraceContentType.RESPONSE_PROBABILITIES;
    }
    var dataSetLength = sim.getStepsRun();
    if (dataSetLength == 0)
        return [];
    if (contentType == TraceContentType.RESPONSE_PROBABILITIES ||
        contentType == TraceContentType.ACTIVATIONS) {
        // figure out what we're analyzing
        var items = void 0;
        if (!Array.isArray(itemsToWatch)) {
            // we don't want to update the object's list -- that's bad form...
            items = discoverItemsToWatch(config);
        }
        else {
            //watchType == WATCHSPECIFIED
            items = itemsToWatch;
        }
        //const items = domain == TraceDomain.WORDS ? sim.config.lexicon.map(x => x.phon) : sim.phonemes.sorted().map(x => x.label)
        // short-circuit if nothing to analyze!
        if (items.length == 0)
            return [];
        // set up data and indexes
        var itemIndices = void 0;
        var activationData = void 0;
        if (domain == TraceDomain.WORDS) {
            itemIndices = itemsToArrayIndices(items, sim.config.lexicon.map(function (x) { return x.phon; }));
            activationData = sim.wordLayer;
        }
        else {
            //if(domain==PHONEMES){
            itemIndices = itemsToArrayIndices(items, sim.phonemes.sorted().map(function (x) { return x.label; }));
            activationData = sim.phonLayer;
        }
        var numDataSets = activationData[0].length;
        var numSlices = Math.floor(sim.config.fSlices / sim.config.slicesPerPhon);
        // we only need responseStrength for plotting response probabilities
        var responseStrengthData = util.zeros3D(dataSetLength, numDataSets, numSlices);
        if (contentType == TraceContentType.RESPONSE_PROBABILITIES) {
            // built the matrix
            for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                    for (var iSlice = 0; iSlice < numSlices; iSlice++) {
                        var d = activationData[iDSL][iNDS][iSlice];
                        // convert it to proportion possible activation
                        // d = (d - param.getMin() ) / (param.getMax() - param.getMin());
                        // do k-value
                        responseStrengthData[iDSL][iNDS][iSlice] = Math.exp(d * (kValue || 1));
                        if (sim.config.freqNode.RDL_post_c && domain == TraceDomain.WORDS) {
                            // From JSM modified TRACE code : S_i =  SWP_i =  e^(k*a_i) * [log 10( c +  f_i )]
                            responseStrengthData[iDSL][iNDS][iSlice] = (0, response_probability_1.applyPostActivationScaling)(sim.config.freqNode, sim.config.lexicon[iNDS].freq, responseStrengthData[iDSL][iNDS][iSlice]);
                        }
                    }
                }
            }
        }
        // set up alignment matricies if needed
        // NB: responseStrength is a monotonic transformation of activationData, so
        // max operations are equivalent. So, we can calculate these alignment
        // matricies regardless of whether we want activations or response strengths.
        var alignmentAdHoc = util.zeros2D(numDataSets, dataSetLength); // int
        var alignmentPostHoc = Array(numDataSets).fill(0); // int
        if (calculationType == TraceCalculationType.MAX_ADHOC) {
            // foreach item
            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                    // find the alignment that maximizes activation for a particular cycle
                    var bestActivation = -1000;
                    for (var iSlices = 0; iSlices < numSlices; iSlices++) {
                        if (activationData[iDSL][iNDS][iSlices] > bestActivation) {
                            bestActivation = activationData[iDSL][iNDS][iSlices];
                            alignmentAdHoc[iNDS][iDSL] = iSlices;
                        }
                    }
                }
            }
        }
        // MAX_ADHOC_2 IS IDENTICAL TO MAX_ADHOC IN THIS PART
        else if (calculationType == TraceCalculationType.MAX_ADHOC_2) {
            // foreach item
            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                    // find the alignment that maximizes activation for a particular cycle
                    var bestActivation = -1000;
                    for (var iSlices = 0; iSlices < numSlices; iSlices++) {
                        if (activationData[iDSL][iNDS][iSlices] > bestActivation) {
                            bestActivation = activationData[iDSL][iNDS][iSlices];
                            alignmentAdHoc[iNDS][iDSL] = iSlices;
                        }
                    }
                }
            }
        }
        else if (calculationType == TraceCalculationType.MAX_POSTHOC) {
            // foreach item
            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                // find the alignment that maximizes activation over all cycles
                var bestActivation = -1000;
                for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                    for (var iSlices = 0; iSlices < numSlices; iSlices++) {
                        if (activationData[iDSL][iNDS][iSlices] > bestActivation) {
                            bestActivation = activationData[iDSL][iNDS][iSlices];
                            alignmentPostHoc[iNDS] = iSlices;
                        }
                    }
                }
            }
        }
        // now, calculate the denominators
        var denominator = Array(dataSetLength).fill(0);
        // denominatorTwo is used if the alignment differs depending on the item;
        // so: denominatorTwo[cycle][item]
        var denominatorTwo = util.zeros2D(dataSetLength, numDataSets);
        if (contentType == TraceContentType.RESPONSE_PROBABILITIES) {
            for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                denominator[iDSL] = 0;
                if (choice == TraceChoice.NORMAL) {
                    switch (calculationType) {
                        case TraceCalculationType.AVERAGE:
                            for (var iSlices = 0; iSlices < numSlices; iSlices++) {
                                for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                                    denominator[iDSL] += responseStrengthData[iDSL][iNDS][iSlices];
                                }
                            }
                            break;
                        case TraceCalculationType.MAX_ADHOC:
                            //in this case, the same alignment selected for target 'ii' is used for all competitor items
                            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                                for (var iiNDS = 0; iiNDS < numDataSets; iiNDS++) {
                                    // for this item (iDSL) and cycle (iiNDS), we know the alignment
                                    denominatorTwo[iDSL][iiNDS] +=
                                        responseStrengthData[iDSL][iNDS][alignmentAdHoc[iiNDS][iDSL]];
                                }
                            }
                            break;
                        case TraceCalculationType.MAX_ADHOC_2:
                            //in this case, the alignment selected for target 'ii' is NOT used for all competitor items
                            //instead, each competitor 'i' uses its own MAX_ADHOC discovered alignment
                            //these are just different ways of considering competition mechanisms, none of which have
                            //much empirical basis.  but see Vroomen & Van Gelder (1995, 1997)
                            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                                for (var iiNDS = 0; iiNDS < numDataSets; iiNDS++) {
                                    // for this item (iDSL) and cycle (iiNDS), we know the alignment
                                    //DIFFERENCE BETWEEN MAX_ADHOC AND MAX_ADHOC_2 OCCURS HERE: alignmentAdHoc[iNDS][iDSL] VERSUS alignmentAdHoc[iiNDS][iDSL]
                                    denominatorTwo[iDSL][iiNDS] +=
                                        responseStrengthData[iDSL][iNDS][alignmentAdHoc[iNDS][iDSL]];
                                }
                            }
                            break;
                        case TraceCalculationType.MAX_POSTHOC:
                            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                                //for (int iiNDS = 0; iiNDS < numDataSets; iiNDS++)
                                {
                                    //denominatorTwo[iDSL][iiNDS] += responseStrengthData[iDSL][iNDS][alignmentPostHoc[iiNDS]]
                                    denominator[iDSL] += responseStrengthData[iDSL][iNDS][alignmentPostHoc[iNDS]];
                                }
                            }
                            break;
                        case TraceCalculationType.STATIC:
                            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                                denominator[iDSL] += responseStrengthData[iDSL][iNDS][alignment];
                            }
                            break;
                        case TraceCalculationType.FRAUENFELDER:
                            // iDSL is the index to a particular cycle of the model
                            // iNDS is the index to an item (word/phoneme) to be graphed
                            // iiNDS is the index to the potential competitors of iNDS
                            // competAlign is an index to an alignment (time slice)
                            // alignment is the user-specified alignment
                            // for all items and competitors of those items,
                            for (var iNDS = 0; iNDS < numDataSets; iNDS++) {
                                for (var iiNDS = 0; iiNDS < numDataSets; iiNDS++) {
                                    // for all possible alignments
                                    for (var competAlign = 0; competAlign < numSlices; competAlign++) {
                                        if (domain == TraceDomain.WORDS) {
                                            // calculate length (in slices) of this word, and its currently examined competitor
                                            var wordExtent = Math.floor(sim.config.deltaInput / sim.config.slicesPerPhon) *
                                                sim.config.lexicon[iNDS].phon.length;
                                            var competExtent = Math.floor(sim.config.deltaInput / sim.config.slicesPerPhon) *
                                                sim.config.lexicon[iiNDS].phon.length;
                                            // if the word and the competitor overlap
                                            if (alignment == competAlign ||
                                                (competAlign > alignment && alignment + wordExtent >= competAlign) ||
                                                (competAlign < alignment && competAlign + competExtent >= alignment)) {
                                                // collect two-dimensional denominator info, ala Post-Hoc and Ad-Hoc.
                                                // varies depending on both cycle and item.
                                                denominatorTwo[iDSL][iNDS] +=
                                                    responseStrengthData[iDSL][iiNDS][competAlign];
                                            }
                                            //if(((alignment<=(competAlign+competExtent))&&alignment>=competAlign&&competExtent>0&&wordExtent>0)||
                                            //   ((competAlign<=(alignment+wordExtent))&&competAlign>=alignment&&competExtent>0&&wordExtent>0))
                                            //    denominatorTwo[iDSL][iNDS] += responseStrengthData[iDSL][iiNDS][competAlign];
                                        }
                                        else {
                                            // domain == PHONEMES
                                            // here, just use this phoneme and its neighbors
                                            if (competAlign == alignment ||
                                                competAlign == alignment - 1 ||
                                                competAlign == alignment + 1)
                                                denominatorTwo[iDSL][iNDS] += responseStrengthData[iDSL][iNDS][competAlign];
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
                else if (choice == TraceChoice.FORCED) {
                    // similar, but now instead of adding all items (iNDS), just loop/add
                    // over the ones we're analyzing
                    switch (calculationType) {
                        case TraceCalculationType.AVERAGE:
                            for (var iSlices = 0; iSlices < numSlices; iSlices++) {
                                for (var iII = 0; iII < itemIndices.length; iII++) {
                                    denominator[iDSL] += responseStrengthData[iDSL][itemIndices[iII]][iSlices];
                                }
                            }
                            break;
                        case TraceCalculationType.MAX_ADHOC:
                            for (var iII = 0; iII < itemIndices.length; iII++) {
                                for (var iiII = 0; iiII < itemIndices.length; iiII++) {
                                    denominatorTwo[iDSL][itemIndices[iII]] +=
                                        responseStrengthData[iDSL][itemIndices[iiII]][alignmentAdHoc[itemIndices[iII]][iDSL]];
                                }
                            }
                            break;
                        case TraceCalculationType.MAX_ADHOC_2:
                            for (var iII = 0; iII < itemIndices.length; iII++) {
                                for (var iiII = 0; iiII < itemIndices.length; iiII++) {
                                    denominatorTwo[iDSL][itemIndices[iII]] +=
                                        responseStrengthData[iDSL][itemIndices[iiII]][alignmentAdHoc[itemIndices[iII]][iDSL]];
                                }
                            }
                            break;
                        case TraceCalculationType.MAX_POSTHOC:
                            for (var iII = 0; iII < itemIndices.length; iII++) {
                                //for (int iiII = 0; iiII < itemIndices.length; iiII++)
                                {
                                    //denominatorTwo[iDSL][itemIndices[iII]] += responseStrengthData[iDSL][itemIndices[iiII]][alignmentPostHoc[itemIndices[iII]]];
                                    denominator[iDSL] +=
                                        responseStrengthData[iDSL][itemIndices[iII]][alignmentPostHoc[itemIndices[iII]]];
                                }
                            }
                            break;
                        case TraceCalculationType.STATIC:
                            for (var iII = 0; iII < itemIndices.length; iII++) {
                                denominator[iDSL] += responseStrengthData[iDSL][itemIndices[iII]][alignment];
                            }
                            break;
                        case TraceCalculationType.FRAUENFELDER:
                            // this too is sorta like AVERAGE, as in NORMAL choice above, except that words have to
                            // both be in the list and overlap
                            //String target = TraceWord.stripDashes(param.getModelInput());
                            //int targetExtent = target.length() * param.getDeltaInput() / param.getSlicesPerPhon();
                            // this is the same idea as with normal choice, above, except iterate only over selected
                            // words/phonemes.
                            for (var iII = 0; iII < itemIndices.length; iII++) {
                                for (var iiII = 0; iiII < itemIndices.length; iiII++) {
                                    for (var competAlign = 0; competAlign < numSlices; competAlign++) {
                                        if (domain == TraceDomain.WORDS) {
                                            var wordExtent = Math.floor(sim.config.deltaInput / sim.config.slicesPerPhon) *
                                                sim.config.lexicon[itemIndices[iII]].phon.length;
                                            var competExtent = Math.floor(sim.config.deltaInput / sim.config.slicesPerPhon) *
                                                sim.config.lexicon[itemIndices[iiII]].phon.length;
                                            // not sure why different logic is used here vs. above... might be a problem.
                                            if ((alignment <= competAlign + competExtent &&
                                                alignment >= competAlign &&
                                                competExtent > 0 &&
                                                wordExtent > 0) ||
                                                (competAlign <= alignment + wordExtent &&
                                                    competAlign >= alignment &&
                                                    competExtent > 0 &&
                                                    wordExtent > 0)) {
                                                denominatorTwo[iDSL][itemIndices[iII]] +=
                                                    responseStrengthData[iDSL][itemIndices[iiII]][competAlign];
                                            }
                                        }
                                        else {
                                            // domain == PHONEMES
                                            if (competAlign == alignment ||
                                                competAlign == alignment - 1 ||
                                                competAlign == alignment + 1)
                                                denominatorTwo[iDSL][itemIndices[iII]] +=
                                                    responseStrengthData[iDSL][itemIndices[iiII]][competAlign];
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            }
        }
        // compute the numerator and the plotData
        var plotData = util.zeros2D(itemIndices.length, dataSetLength);
        // loop over items
        for (var iII = 0; iII < itemIndices.length; iII++) {
            // loop over cycles
            for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                // compute the numerator
                var numerator = 0;
                var numSrc = // points to either responseStrengthData or activationData;
                 void 0; // points to either responseStrengthData or activationData;
                if (contentType == TraceContentType.RESPONSE_PROBABILITIES)
                    numSrc = responseStrengthData;
                //(contentType == ACTIVATIONS)
                else
                    numSrc = activationData;
                switch (calculationType) {
                    case TraceCalculationType.AVERAGE:
                        for (var iSlices = 0; iSlices < numSlices; iSlices++) {
                            numerator += numSrc[iDSL][itemIndices[iII]][iSlices];
                        }
                        numerator /= numSlices;
                        break;
                    case TraceCalculationType.MAX_ADHOC:
                        numerator = numSrc[iDSL][itemIndices[iII]][alignmentAdHoc[itemIndices[iII]][iDSL]];
                        break;
                    case TraceCalculationType.MAX_ADHOC_2:
                        numerator = numSrc[iDSL][itemIndices[iII]][alignmentAdHoc[itemIndices[iII]][iDSL]];
                        break;
                    case TraceCalculationType.MAX_POSTHOC:
                        numerator = numSrc[iDSL][itemIndices[iII]][alignmentPostHoc[itemIndices[iII]]];
                        break;
                    case TraceCalculationType.STATIC:
                        numerator = numSrc[iDSL][itemIndices[iII]][alignment];
                        break;
                    case TraceCalculationType.FRAUENFELDER:
                        numerator =
                            numSrc[iDSL][itemIndices[iII]][alignment] +
                                numSrc[iDSL][itemIndices[iII]][alignment + 1]; // @@@ check for array out of bounds
                        break;
                }
                // compute the plotData
                if (contentType == TraceContentType.RESPONSE_PROBABILITIES) {
                    switch (calculationType) {
                        case TraceCalculationType.AVERAGE:
                            plotData[iII][iDSL] = numerator / denominator[iDSL];
                            break;
                        case TraceCalculationType.MAX_ADHOC:
                            plotData[iII][iDSL] = numerator / denominatorTwo[iDSL][itemIndices[iII]];
                            break;
                        case TraceCalculationType.MAX_ADHOC_2:
                            plotData[iII][iDSL] = numerator / denominatorTwo[iDSL][itemIndices[iII]];
                            break;
                        case TraceCalculationType.MAX_POSTHOC:
                            //plotData[iII][iDSL] = numerator / denominatorTwo[iDSL][itemIndices[iII]];
                            plotData[iII][iDSL] = numerator / denominator[iDSL];
                            break;
                        case TraceCalculationType.STATIC:
                            plotData[iII][iDSL] = numerator / denominator[iDSL];
                            break;
                        case TraceCalculationType.FRAUENFELDER:
                            plotData[iII][iDSL] = numerator / denominatorTwo[iDSL][itemIndices[iII]];
                            break;
                        default:
                            break;
                    }
                } //ACTIVATIONS
                else
                    plotData[iII][iDSL] = numerator;
            }
        }
        // convert data to an XYSeriesCollection
        var oneSeries = void 0;
        var ret = [];
        for (var iII = 0; iII < itemIndices.length; iII++) {
            // get the name of the series from the lexicon (for purposes of this stub)
            if (domain == TraceDomain.WORDS) {
                oneSeries = {
                    label: sim.config.lexicon[itemIndices[iII]].phon,
                    data: [],
                };
                // if (calculationType == TraceCalculationType.MAX_POSTHOC)
                //   oneSeries.setDescription(oneSeries.getName().concat(" "+alignmentPostHoc[itemIndices[iII]]))
                // else
                //   oneSeries.setDescription(oneSeries.getName())
            }
            else {
                //if(domain == PHONEMES)
                oneSeries = {
                    label: sim.phonemes.sorted()[itemIndices[iII]].label,
                    data: [],
                };
                // if (calculationType == MAX_POSTHOC)
                //   oneSeries.setDescription(oneSeries.getName().concat(" "+alignmentPostHoc[itemIndices[iII]]))
                // else
                //   oneSeries.setDescription(oneSeries.getName())
            }
            for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                // X is time step, y is data
                oneSeries.data.push({ x: iDSL, y: plotData[iII][iDSL] });
            }
            // add alignment to labels
            switch (calculationType) {
                case TraceCalculationType.MAX_ADHOC:
                case TraceCalculationType.MAX_ADHOC_2:
                    oneSeries.label += " [".concat(alignmentAdHoc[itemIndices[iII]].join(','), "]");
                    break;
                case TraceCalculationType.MAX_POSTHOC:
                    oneSeries.label += " [".concat(alignmentPostHoc[itemIndices[iII]], "]");
                    break;
                case TraceCalculationType.STATIC:
                case TraceCalculationType.FRAUENFELDER:
                    oneSeries.label += " [".concat(alignment, "]");
                    break;
                default:
                    break;
            }
            ret.push(oneSeries);
        }
        return ret;
    }
    else {
        //if competitionIndex
        // convert data to an XYSeriesCollection
        var oneSeries = void 0;
        var ret = [];
        var compIndex = void 0;
        if (domain == TraceDomain.WORDS) {
            compIndex = sim.globalLexicalCompetition;
            oneSeries = { label: 'Lexical Competition', data: [] };
        }
        else {
            compIndex = sim.globalPhonemeCompetition;
            oneSeries = { label: 'Phoneme Competition', data: [] };
        }
        if (competType == TraceCompetitionType.RAW) {
            // competIndex, raw, not a slope line
            for (var iDSL = 0; iDSL < dataSetLength; iDSL++) {
                // X is time step, y is data
                //System.out.println("add\t"+iDSL+"\t"+compIndex[iDSL]);
                oneSeries.data.push({ x: iDSL, y: compIndex[iDSL] });
            }
            ret.push(oneSeries);
        }
        else if (competType == TraceCompetitionType.FIRST_DERIVATIVE) {
            // first derivative
            var firstDeriv = slopeRegress(compIndex, competSlope, dataSetLength);
            for (var iDSL = 0; iDSL < firstDeriv.length; iDSL++) {
                // X is time step, y is data
                //System.out.println("add\t"+iDSL+"\t"+firstDeriv[iDSL]);
                oneSeries.data.push({ x: iDSL, y: firstDeriv[iDSL] });
            }
            ret.push(oneSeries);
        }
        else if (competType == TraceCompetitionType.SECOND_DERIVATIVE) {
            // second derivative
            var firstDeriv = slopeRegress(compIndex, competSlope, dataSetLength - 1);
            var secondDeriv = slopeRegress(firstDeriv, competSlope, dataSetLength - 2);
            for (var iDSL = 0; iDSL < secondDeriv.length; iDSL++) {
                // X is time step, y is data
                oneSeries.data.push({ x: iDSL, y: secondDeriv[iDSL] });
            }
            ret.push(oneSeries);
        }
        return ret;
    }
};
exports.doSimAnalysis = doSimAnalysis;
function getAnalysisData(data, padLabels) {
    if (padLabels === void 0) { padLabels = false; }
    if (data.length > 0) {
        return __spreadArray([
            __spreadArray(['cycle'], data.map(function (x) { return (padLabels ? x.label.padEnd(18) : x.label); }), true)
        ], Array.from(Array(data[0].data.length), function (_, cycle) { return __spreadArray([
            cycle
        ], data.map(function (x) { var _a; return ((_a = x.data[cycle].y) === null || _a === void 0 ? void 0 : _a.toFixed(18)) || NaN; }), true); }), true);
    }
    return [];
}
exports.getAnalysisData = getAnalysisData;
function formatAnalysis(data, padLabels) {
    if (padLabels === void 0) { padLabels = false; }
    return getAnalysisData(data, padLabels)
        .map(function (row) { return row.join('\t'); })
        .join('\n');
}
exports.formatAnalysis = formatAnalysis;
