"use strict";
// This file is excluded from browser builds (see trace-sim-browser.js)
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var zlib = __importStar(require("zlib"));
var trace_sim_base_1 = __importDefault(require("./trace-sim-base"));
function writeFile(filepath, data, headers) {
    var _a, _b, _c;
    var numRows = ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.length) || 0;
    var numCols = ((_c = (_b = data[0]) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.length) || 0;
    var allCycles = [];
    for (var row = 0; row < numRows; row++) {
        for (var cycle = 0; cycle < data.length; cycle++) {
            allCycles.push(__spreadArray([cycle], data[cycle][row], true));
        }
    }
    var dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    var csvContent = allCycles.map(function (row) { return row.join(', '); }).join('\n');
    var fileContent = headers ? "".concat(headers, "\n").concat(csvContent) : csvContent;
    // Write as gzip compressed file with .gz extension
    var gzPath = filepath + '.gz';
    fs.writeFileSync(gzPath, zlib.gzipSync(fileContent));
}
function write(stream, data) {
    return new Promise(function (resolve) {
        if (!stream.write(data)) {
            stream.once('drain', resolve);
        }
        else {
            process.nextTick(resolve);
        }
    });
}
var TraceSim = /** @class */ (function (_super) {
    __extends(TraceSim, _super);
    function TraceSim() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TraceSim.prototype.writeFiles = function (dir, prefix) {
        var _a, _b;
        if (prefix === void 0) { prefix = ''; }
        var prefixUnderscore = prefix ? "".concat(prefix, "_") : '';
        var _c = this.getSimData(), input = _c.input, feature = _c.feature, phoneme = _c.phoneme, word = _c.word;
        var numTimeSlices = ((_b = (_a = feature[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) - 1 || 0; // -1 to exclude the index column
        var timeHeaders = Array.from({ length: numTimeSlices }, function (_, i) { return "t".concat(i); }).join(', ');
        var inputHeader = "cycle, input, feature_index, ".concat(timeHeaders);
        var featureHeader = "cycle, input, feature_index, ".concat(timeHeaders);
        var phonemeHeader = "cycle, input, phoneme, ".concat(timeHeaders);
        var wordHeader = "cycle, input, word, ".concat(timeHeaders);
        writeFile(path.join(dir, "".concat(prefixUnderscore, "input.csv")), input, inputHeader);
        writeFile(path.join(dir, "".concat(prefixUnderscore, "feature.csv")), feature, featureHeader);
        writeFile(path.join(dir, "".concat(prefixUnderscore, "phoneme.csv")), phoneme, phonemeHeader);
        writeFile(path.join(dir, "".concat(prefixUnderscore, "word.csv")), word, wordHeader);
    };
    TraceSim.prototype.appendInputData = function (file, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, write(file, this.serializeInputData(prefix))];
            });
        });
    };
    TraceSim.prototype.appendFeatureData = function (file, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, write(file, this.serializeFeatureData(prefix))];
            });
        });
    };
    TraceSim.prototype.appendPhonemeData = function (file, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, write(file, this.serializePhonemeData(prefix))];
            });
        });
    };
    TraceSim.prototype.appendWordData = function (file, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, write(file, this.serializeWordData(prefix))];
            });
        });
    };
    TraceSim.prototype.appendLevelsAndFlowData = function (file, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, write(file, this.serializeLevelsAndFlowData(prefix))];
            });
        });
    };
    TraceSim.prototype.appendFiles = function (files, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.appendInputData(files[0], prefix),
                            this.appendFeatureData(files[1], prefix),
                            this.appendPhonemeData(files[2], prefix),
                            this.appendWordData(files[3], prefix),
                            this.appendLevelsAndFlowData(files[4], prefix),
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TraceSim;
}(trace_sim_base_1.default));
exports.default = TraceSim;
