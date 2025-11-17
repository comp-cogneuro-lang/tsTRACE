# tsTRACE System Design Document

**Version:** 1.0
**Date:** 2023-10-18
**Author:** System Design Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Overview](#architecture-overview)
4. [Backend Package: tracejs](#backend-package-tracejs)
5. [Frontend Package: tracejs-vue](#frontend-package-tracejs-vue)
6. [Integration Layer](#integration-layer)
7. [User Interface and User Experience](#user-interface-and-user-experience)
8. [Data Flow](#data-flow)
9. [Key Algorithms and Models](#key-algorithms-and-models)
10. [File Formats and Data Structures](#file-formats-and-data-structures)
11. [Development Environment](#development-environment)
12. [Deployment Architecture](#deployment-architecture)
13. [Performance Considerations](#performance-considerations)
14. [Security Considerations](#security-considerations)
15. [Future Enhancements](#future-enhancements)
16. [Appendices](#appendices)

---

## Executive Summary

**tsTRACE** (formerly jsTRACE) is a TypeScript/JavaScript reimplementation of the TRACE model of speech perception and spoken word recognition, originally developed by McClelland & Elman (1986). The system is architected as a **monorepo** containing multiple NPM packages:

- **tracejs**: Core simulation library (backend)
- **tracejs-vue**: Web-based GUI (frontend)
- **playground**: Development/testing workspace

The primary purpose of tsTRACE is to provide researchers and educators with an accessible, browser-based implementation of TRACE for:
1. Testing actual model predictions vs. speculative predictions
2. Educational demonstrations of interactive activation neural networks
3. Conducting speech perception experiments with configurable parameters

### Key Architectural Decisions

- **Monorepo Structure**: Yarn workspaces enable code sharing and unified dependency management
- **Dual Execution Contexts**: Library works in both Node.js (with file I/O) and browsers (in-memory only)
- **Framework Choice**: Vue 3 with Composition API for reactive, type-safe frontend
- **Build Tool**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript throughout the entire codebase

---

## System Overview

### What is TRACE?

TRACE is an **Interactive Activation Model** that simulates human speech perception through a multi-layered neural network with:

- **Three Processing Layers**: Features (acoustic), Phonemes (phonological), Words (lexical)
- **Bidirectional Information Flow**: Bottom-up activation and top-down feedback
- **Competitive Inhibition**: Within-layer competition for winner-take-all dynamics
- **Temporal Processing**: Explicit representation of time through spatially-replicated units

### System Purpose

1. **Research Tool**: Enable precise testing of model predictions against experimental data
2. **Educational Platform**: Interactive visualization of neural network dynamics
3. **Batch Processing**: Support for automated parameter exploration via scripts
4. **Cross-Platform**: Works in modern web browsers without installation

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        tsTRACE Monorepo                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼─────────┐
        │   tracejs    │ │ tracejs-vue│ │  playground   │
        │   (Backend)  │ │ (Frontend) │ │ (Dev/Test)    │
        └──────────────┘ └────────────┘ └───────────────┘
                │               │
                │   ┌───────────┘
                │   │
        ┌───────▼───▼────────────────────────────────────┐
        │         Integration Layer                      │
        │  - ES Modules (browser)                        │
        │  - CommonJS (Node.js)                          │
        │  - TypeScript type definitions                 │
        └────────────────────────────────────────────────┘
```

### Package Responsibilities

| Package | Purpose | Key Technologies | Exports |
|---------|---------|------------------|---------|
| **tracejs** | TRACE model simulation engine | TypeScript, Node.js | TraceSim, TraceNet, config utilities, analysis tools |
| **tracejs-vue** | Web-based user interface | Vue 3, Vite, Bulma, Chart.js | N/A (web application) |
| **playground** | Development sandbox | JavaScript, Node.js | N/A (dev tool) |

---

## Backend Package: tracejs

### Architecture

The backend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Public API Layer                      │
│  index.ts - Exports all public interfaces               │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  TraceSim - High-level simulation orchestration         │
│  TracSimAnalysis - Post-processing & analysis           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Core Domain Layer                     │
│  TraceNet - Neural network simulation engine            │
│  TracePhones - Phonological representations             │
│  TraceParam - Configuration & data structures           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                      │
│  File I/O (stream.ts)                                   │
│  XML/JSON parsing (jtrace-input.ts)                     │
│  Error handling (errors.ts)                             │
└─────────────────────────────────────────────────────────┘
```

### Core Classes

#### 1. TraceNet (`trace-net.ts`)

**Purpose**: Implements the core TRACE interactive activation neural network.

**Key Responsibilities**:
- Manage three-layer network (features, phonemes, words)
- Execute activation spreading algorithm
- Handle competitive inhibition
- Process phonological input into pseudo-spectral features

**Critical Data Structures**:
```typescript
class TraceNet {
  // Layer activations (current state)
  inputLayer: number[][]    // [feature][timeSlice]
  featLayer: number[][]     // [feature][timeSlice]
  phonLayer: number[][]     // [phoneme][timeSlice]
  wordLayer: number[][]     // [word][timeSlice]

  // Network inputs (temporary computation)
  featNet: number[][]
  phonNet: number[][]
  wordNet: number[][]

  // Connection weights
  pww: number[][]           // phoneme-to-word weights
  wpw: number[][]           // word-to-phoneme weights
  fpw: number[][][]         // feature-to-phoneme weights
  pfw: number[][][]         // phoneme-to-feature weights
}
```

**Core Algorithm** (per cycle):
```
1. actFeatures()       → Input → Features, Feature ↔ Feature inhibition
2. For each repetition (nreps):
   a. featToPhon()     → Feature → Phoneme excitation
   b. phonToPhon()     → Phoneme ↔ Phoneme inhibition
   c. phonToWord()     → Phoneme → Word excitation
   d. wordToPhon()     → Word → Phoneme feedback
   e. wordToWord()     → Word ↔ Word inhibition
   f. featUpdate()     → Apply decay, noise, clamping
   g. phonUpdate()     → Apply decay, noise, clamping
   h. wordUpdate()     → Apply decay, noise, clamping
```

**Activation Update Equation**:
```typescript
// Net input determines direction of change
if (net > 0) {
  activation += (max - activation) * net  // Approach max
} else {
  activation += (activation - min) * net  // Approach min
}

// Apply decay toward resting level
activation -= decay * (activation - rest)

// Add optional stochastic noise
activation += gaussianNoise(0, stochasticitySD)

// Clamp to bounds
activation = clamp(activation, min, max)
```

---

#### 2. TraceSimBase (`trace-sim-base.ts`)

**Purpose**: Abstract base class that wraps TraceNet and manages historical data collection.

**Key Responsibilities**:
- Store activation history across all cycles
- Record global metrics (competition indices, information flow)
- Provide data extraction and serialization methods
- Abstract platform-specific I/O operations

**Data Storage**:
```typescript
class TraceSimBase {
  // Historical activations [cycle][unit][timeSlice]
  inputLayer: number[][][]
  featLayer: number[][][]
  phonLayer: number[][][]
  wordLayer: number[][][]

  // Global metrics per cycle
  globalFeatureCompetition: number[]
  globalPhonemeCompetition: number[]
  globalLexicalCompetition: number[]
  globalPhonToWordSum: number[]
  globalWordToPhonSum: number[]
}
```

**Key Methods**:
- `cycle(numCycles: number)`: Run simulation for N cycles
- `getInputData(cycle)`, `getPhonemeData(cycle)`, `getWordData(cycle)`: Extract layer snapshots
- `serializeInputData()`, `serializePhonemeData()`, etc.: Convert to CSV format

---

#### 3. TraceSim (`trace-sim.ts`)

**Purpose**: Node.js-specific implementation with file I/O capabilities.

**Additional Features**:
- File output to CSV with optional gzip compression
- Streaming data writes for large simulations
- Batch file operations

**Example Usage**:
```typescript
import { TraceSim, createDefaultConfig } from 'tracejs';

const config = createDefaultConfig();
config.modelInput = '-slit-';
config.cyclesToCalculate = 60;

const sim = new TraceSim(config);
sim.cycle(60);
sim.writeFiles('/output/dir', 'slit');  // Writes CSV files
```

---

#### 4. TracePhones (`trace-phones.ts`)

**Purpose**: Manage phoneme inventory and phoneme continua.

**Responsibilities**:
- Store phoneme definitions (7 continua × 9 features per phoneme)
- Temporal spreading of phoneme features based on spread parameters
- Create perceptual continua for categorical perception experiments

**Key Methods**:
```typescript
spreadPhons(spread, scale, min, max)  // Apply temporal spreading
makePhonemeContinuum(from, to, steps) // Create interpolated phonemes
byLabel(label): TracePhone            // Lookup by phoneme symbol
```

**Phoneme Definition**:
```typescript
interface TracePhone {
  label: string;           // e.g., 'p', 'b', 't'
  features: number[];      // 63 values (7 continua × 9 features)
  durationScalar: number[];// Temporal spreading scalars
}
```

---

### Configuration System

**TraceConfig Interface**: Comprehensive parameter specification (50+ parameters)

```typescript
interface TraceConfig {
  // ===== Model Structure =====
  continuaPerFeature: number;    // 7 - dimensions per feature
  numFeatures: number;           // 9 - acoustic features
  fSlices: number;               // 99 - temporal resolution
  slicesPerPhon: number;         // 3 - phoneme duration

  // ===== Input Specification =====
  modelInput: string;            // e.g., "-^br^pt-"
  deltaInput: number;            // 6 - phoneme onset spacing

  // ===== Network Dynamics =====
  decay: {F, P, W};              // Decay rates per layer
  rest: {F, P, W};               // Resting levels
  alpha: {IF, FP, PW, WP, PF};   // Excitatory strengths
  gamma: {F, P, W};              // Inhibitory strengths

  // ===== Temporal Parameters =====
  spread: number[];              // [6,6,6,6,6,6,6] - feature spreading
  spreadScale: number[];         // Scaling factors

  // ===== Activation Bounds =====
  min: number;                   // -0.3
  max: number;                   // 1.0

  // ===== Stochasticity =====
  noiseSD: number;               // Input noise
  stochasticitySD: number;       // Processing noise

  // ===== Advanced Features =====
  lengthNormalization: number;   // 0/1 - compensate for word length
  nreps: number;                 // Cycles per step
  atten: number;                 // Attention modulation
  bias: number;                  // Lexical bias

  // ===== Frequency & Priming =====
  freqNode: RdlNode;             // Frequency parameters
  primeNode: RdlNode;            // Priming parameters

  // ===== Data =====
  phonology: TracePhone[];       // Phoneme inventory (15 default)
  lexicon: TraceWord[];          // Word lexicon (~200 default)
  continuumSpec: string;         // Phoneme continuum spec
}
```

---

### Input/Output Formats

#### Input Formats

**1. Phonological Input String**:
```
"-^br^pt-"
```
- `-` = silence
- `^` = schwa (unstressed vowel)
- Letters = phonemes (p, b, t, d, k, g, s, S, r, l, a, i, u)
- `{p5d}` = spliced phoneme (5 slices of 'p', then 'd')

**2. Lexicon (XML - jTRACE compatible)**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<lexicon>
  <lexeme>
    <label>abrupt</label>
    <phonology>^br^pt</phonology>
    <frequency>37</frequency>
    <prime>0</prime>
  </lexeme>
</lexicon>
```

**3. Phonology (XML)**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phonology>
  <phonemes>
    <phoneme>
      <symbol>p</symbol>
      <features>0 0 0 0 1.0 0 0 ...</features>
      <durationScalar>1 1 1 1 1 1 1</durationScalar>
    </phoneme>
  </phonemes>
</phonology>
```

**4. JSON formats**: Also supported via `parseJsonLexicon()` and `parseJsonPhonology()`

#### Output Formats

**CSV Data Files** (optionally gzipped):
```csv
cycle, [modelInput], [prefix...], label, slice0, slice1, slice2, ...
0, -^br^pt-, phoneme_label, 0.0000, 0.1234, ...
1, -^br^pt-, phoneme_label, 0.0100, 0.1456, ...
```

**Output Files**:
- `input.csv` - Input layer activations
- `feature.csv` - Feature layer activations
- `phoneme.csv` - Phoneme layer activations
- `word.csv` - Word layer activations
- `levels_and_flow.csv` - Global metrics per cycle

---

### CLI and REPL

**Entry Point**: `bin/cli.js`

**Two Modes**:

1. **REPL Mode** (interactive):
```bash
$ tracejs
> const config = tracejs.createDefaultConfig()
> const sim = new tracejs.TraceSim(config)
> sim.cycle(60)
> sim.wordLayer[59]  // Inspect final activations
```

2. **Script Execution Mode**:
```bash
$ tracejs my-simulation.js
```

---

### Analysis Capabilities

**TraceSimAnalysis Module**: Post-simulation analysis tools

**Analysis Types**:
1. **Activations**: Raw layer activations
2. **Response Probabilities**: Luce Choice Rule probabilities
3. **Competition Index**: Global competition metrics

**Alignment Strategies**:
- **STATIC**: Fixed temporal alignment
- **AVERAGE**: Average across all time slices
- **MAX_POSTHOC**: Best alignment found after simulation
- **MAX_ADHOC**: Best alignment at each cycle
- **MAX_ADHOC_2**: Item-specific best alignment
- **FRAUENFELDER**: Overlap-based competition

**Response Probability Calculation (Luce Choice Rule)**:
```typescript
// Step 1: Calculate response strengths
S_i = exp(k * activation_i)

// Step 2: Normalize to probabilities
P_i = S_i / sum(S_j for all j)

// Optional: Scale by frequency
S_i *= log10(c + frequency_i)
```

---

### Browser Compatibility

**Strategy**: Browser field mapping in package.json

```json
{
  "browser": {
    "./dist/esm/trace-sim.js": "./dist/esm/browser/trace-sim.js",
    "./dist/esm/stream.js": "./dist/esm/browser/stream.js",
    "./dist/esm/jtrace-file-input.js": "./dist/esm/browser/jtrace-file-input.js"
  }
}
```

**Browser Shims**:
- `src/browser/trace-sim.ts`: No-op file I/O methods
- `src/browser/stream.ts`: Empty stream implementations
- `src/browser/jtrace-file-input.ts`: No file loading

**Result**: Core simulation engine (TraceNet, TraceSimBase) works identically in Node.js and browsers.

---

### Dependencies

**Runtime**:
- `fast-xml-parser (^4.2.4)`: XML parsing for jTRACE files
- `typanion (^3.12.1)`: Runtime type validation

**Development**:
- `TypeScript (^5.1.3)`
- `Jest (^29.5.0)` + `ts-jest`: Testing
- `Prettier (^2.8.8)`: Code formatting

**Node.js Built-ins**:
- `fs`, `path`, `stream`, `zlib`, `repl`

---

## Frontend Package: tracejs-vue

### Architecture

The frontend follows a **component-based architecture** with reactive state management:

```
┌─────────────────────────────────────────────────────────┐
│                   Application Shell                      │
│  App.vue - Root component, tab navigation               │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   State Management                       │
│  store.ts - Reactive global state (Vue 3 DI)            │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    View Layer (Tabs)                     │
│  ConfigTab | SimulationTab | ChartTab | DataTab         │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Component Library                       │
│  NavigationTabs, SimulationToolbar, AnalysisConfig,     │
│  Charts (Matrix, Box, Scatter), ConfigInput, etc.       │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              Visualization Layer                         │
│  Chart.js + Custom Controllers (Matrix, Box)            │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Vue 3.3.4 | Reactive UI with Composition API |
| **Language** | TypeScript 5.1.3 | Type safety |
| **Build Tool** | Vite 4.3.9 | Fast dev server & optimized builds |
| **CSS Framework** | Bulma 0.9.4 | Styling & layout |
| **Charts** | Chart.js ~2.8.0 | Data visualization |
| **File Handling** | file-saver, jszip-esm | Data export |
| **Backend** | tracejs (local) | Simulation engine |

---

### Application Structure

**Entry Points**:
```html
<!-- index.html -->
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import 'bulma/css/bulma.css';

createApp(App).mount('#app');
```

---

### State Management

**Architecture**: Custom reactive store using Vue 3 Dependency Injection (not Vuex/Pinia)

```typescript
// store.ts
class Store {
  // Reactive configuration (deep reactivity)
  readonly config = reactive(createDefaultConfig());

  // Analysis configuration
  readonly analysisConfig = reactive({
    domain: TraceDomain.WORD,
    calculationType: TraceCalculationType.ACTIVATION,
    // ... more analysis params
  });

  // Simulation reference
  readonly sim = ref<TraceSim | null>(null);

  // Computed properties
  readonly configHash = computed(() => hashSum(this.config));
  readonly hasUnsavedChanges = computed(() => {
    // Detect config changes
  });

  // Methods
  runSimulation() { /* ... */ }
  getAnalysisData() { /* ... */ }
}

// Provide/Inject pattern
export const createStore = () => {
  const store = new Store();
  provide(StoreSymbol, store);
  return store;
};

export const getStore = () => inject<Store>(StoreSymbol)!;
```

**Benefits**:
- Type-safe dependency injection
- Reactive state without boilerplate
- Scoped to component tree
- Easy testing

---

### Component Architecture

**Primary Tabs**:

```
App.vue
├─ ConfigTab
│  ├─ NavigationTabs (sub-tabs)
│  ├─ ParametersTab
│  │  ├─ ConfigInput (model input visualization)
│  │  ├─ Parameter controls (alpha, gamma, decay, etc.)
│  │  └─ Import/Export (JSON)
│  ├─ PhonologyTab
│  │  ├─ Phoneme table editor
│  │  └─ Import/Export (XML/JSON)
│  └─ LexiconTab
│     ├─ Word table editor
│     └─ Import/Export (XML/JSON)
├─ SimulationTab
│  ├─ SimulationToolbar (cycles, simulate, animation)
│  ├─ ConfigInput (input visualization)
│  └─ 2×2 Grid of Charts
│     ├─ InputChart (matrix)
│     ├─ FeatureChart (matrix)
│     ├─ PhonemeChart (matrix/box)
│     └─ WordChart (matrix/box)
├─ ChartTab
│  ├─ SimulationToolbar
│  ├─ AnalysisConfig (domain, content, alignment, items)
│  └─ AnalysisChart (scatter/line)
└─ DataTab
   ├─ NavigationTabs (sub-tabs)
   ├─ ChartDataTab (analysis data table)
   ├─ InputTab (input data table)
   ├─ FeatureTab (feature data table)
   ├─ PhonemeTab (phoneme data table)
   ├─ WordTab (word data table)
   └─ LevelsAndFlowTab (global metrics table)
```

---

### Key Features

#### 1. Config Tab

**Parameters Sub-tab**:
- Model input text field with live validation
- Continuum specification (phoneme interpolation)
- 50+ configurable parameters:
  - Network weights (ALPHA: IF, FP, PW, WP, PF)
  - Lateral inhibition (GAMMA: F, P, W)
  - Decay rates (F, P, W)
  - Resting levels (F, P, W)
  - Noise and stochasticity
  - Frequency and priming effects
  - Temporal parameters
- JSON import/export
- Live preview of model input visualization

**Phonology Sub-tab**:
- Interactive phoneme editor (table-based)
- Phoneme features across 7 continua × 9 features
- Duration scalar configuration
- Add/delete phonemes
- XML/JSON import/export

**Lexicon Sub-tab**:
- Word list management (table-based)
- Frequency and priming values
- Add/delete operations
- XML/JSON import/export

---

#### 2. Simulation Tab

**Controls**:
- Cycles to calculate (1-287)
- Simulate button (runs in background)
- Current cycle selector (dropdown, +/-, slider)
- Animation controls (start/stop, auto-advance)
- Toggle between matrix and box chart views
- Save simulation data (ZIP export)

**Visualizations** (2×2 grid):
1. **Model Input** (matrix chart)
   - X-axis: Feature time slices
   - Y-axis: Features (63 rows: 7 continua × 9 features)
   - Color: Input intensity (darker = higher)

2. **Feature Activations** (matrix chart)
   - X-axis: Feature time slices
   - Y-axis: Features (63 rows)
   - Color: Activation level (darker = higher)

3. **Phoneme Activations** (matrix or box chart)
   - Matrix mode:
     - X-axis: Phoneme time slices (33 default)
     - Y-axis: Phonemes (15 default)
     - Color: Activation level
   - Box mode:
     - X-axis: Phoneme time slices
     - Y-axis: Activation magnitude (0-1)
     - Phoneme labels scaled to temporal extent

4. **Word Activations** (matrix or box chart)
   - Matrix mode:
     - Shows top 10 words by peak activation
     - X-axis: Word time slices (33 default)
     - Y-axis: Words (10 rows)
     - Color: Activation level
   - Box mode:
     - Shows top 10 words with activation > 0.25
     - Word labels scaled to length
     - Color-coded by activation rank

---

#### 3. Chart Tab

**Analysis Configuration**:
- **Domain**: Words or Phonemes
- **Content Type**:
  - Activations (raw)
  - Response Probabilities (Luce Choice Rule)
  - Competition Index (raw, 1st derivative, 2nd derivative)
- **Item Selection**:
  - Top N items (configurable)
  - Exclude silence (checkbox)
  - Use selected items (word-specific checkboxes)
- **Alignment Calculation**:
  - Specified alignment (default: 4)
  - Max Post-Hoc (best overall alignment)
- **Luce Choice Parameters**:
  - k-value (scaling constant)
  - Choice mode (all items vs. forced choice)
- **Competition Index Parameters**:
  - Sample width (for derivative calculation)

**Visualization**:
- Large scatter/line chart
- Multi-series support (up to 22 colors)
- Legend with item labels and alignments
- Refresh chart button

---

#### 4. Data Tab

**Six Sub-tabs**:

1. **Chart Data**: Formatted analysis data (tab-separated)
2. **Input**: Model input layer data
3. **Feature**: Feature layer activations
4. **Phoneme**: Phoneme layer activations
5. **Word**: Word layer activations
6. **Levels and Flow**: Global metrics (competition, information flow)

**Features**:
- Cycle navigation (where applicable)
- Tab-separated values for easy copying
- Save simulation data (ZIP export with all layers)

---

### Data Visualization

#### Chart Types

**1. Matrix Charts (Heatmap)**

**Implementation**: Custom Chart.js controller (`chartjs-chart-matrix.js`)

**Usage**: Feature activations, phoneme activations, word activations, model input

**Visual Encoding**:
- X-axis: Temporal alignment (time slices)
- Y-axis: Items (features/phonemes/words)
- Color: Activation level (black alpha channel, 0=transparent, 1=black)

**Custom Plugins**:
- Y-axis label centering (aligns labels to cell centers)

---

**2. Box Charts (Word Overlay)**

**Implementation**: Custom Chart.js controller (`chartjs-box.js`)

**Usage**: Alternative view for word/phoneme activations

**Visual Encoding**:
- X-axis: Temporal alignment
- Y-axis: Activation magnitude (0-1)
- Text: Actual word/phoneme labels scaled to temporal extent
- Color: Activation rank (top 10 color-coded)

**Performance Optimization**: Limited to top 10 items to avoid rendering overhead

---

**3. Scatter/Line Charts**

**Implementation**: Standard Chart.js scatter chart

**Usage**: Analysis chart

**Visual Encoding**:
- X-axis: Cycles
- Y-axis: Activation / Response Probability / Competition Index
- Series: Multiple items with color coding

---

#### Chart Configuration

**Performance Optimizations**:
```typescript
{
  animation: false,           // Disable animations
  responsive: true,           // Responsive sizing
  maintainAspectRatio: true,  // Fixed aspect
  hover: { mode: null },      // Disable hover effects
  tooltips: { enabled: false }// Disable tooltips
}
```

**Custom Y-Axis Centering Plugin**:
```typescript
Chart.plugins.register({
  afterDraw: (chart) => {
    // Center Y-axis labels on cells
    const yAxis = chart.scales['y-axis-0'];
    const cellHeight = yAxis.height / yAxis.ticks.length;
    // ... adjust label positions
  }
});
```

---

### Configuration and Build

**Vite Configuration** (`vite.config.ts`):
```typescript
export default defineConfig({
  base: '/tracejs/',  // Deploy to GitHub Pages subdirectory
  plugins: [vue()]
});
```

**TypeScript Configuration**:
- Target: ESNext
- Module: ESNext
- Strict mode enabled
- JSX preserved for Vue
- Source maps enabled

**Build Scripts**:
```json
{
  "dev": "vite",               // Development server
  "build": "vite build",       // Production build
  "serve": "vite preview",     // Preview production build
  "lint": "prettier --write ." // Format code
}
```

**Code Style** (Prettier):
- Single quotes
- 100 character line width
- Automatic import organization

---

## Integration Layer

### How Backend and Frontend Work Together

```
┌─────────────────────────────────────────────────────────┐
│                    tracejs-vue (Frontend)                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ User Interface                                     │ │
│  │  - Configure parameters                            │ │
│  │  - Trigger simulation                              │ │
│  │  - View results                                    │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │ Store (store.ts)                                   │ │
│  │  config = reactive(createDefaultConfig())          │ │
│  │  sim = ref<TraceSim | null>(null)                  │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│                   │ import { TraceSim, ... } from 'tracejs'
│                   │                                      │
└───────────────────┼──────────────────────────────────────┘
                    │
                    │ runSimulation() {
                    │   const configCopy = JSON.parse(JSON.stringify(this.config))
                    │   const sim = new TraceSim(configCopy)
                    │   sim.cycle(this.cyclesToCalculate.value)
                    │   this.sim.value = sim
                    │ }
                    │
┌───────────────────▼──────────────────────────────────────┐
│                   tracejs (Backend)                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ TraceSim (Browser Shim)                            │ │
│  │  - In-memory simulation (no file I/O)             │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │ TraceSimBase (Core Logic)                          │ │
│  │  - Data collection                                 │ │
│  │  - Serialization methods                           │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │ TraceNet (Neural Network Engine)                   │ │
│  │  - Activation spreading                            │ │
│  │  - Competitive inhibition                          │ │
│  │  - Temporal dynamics                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Integration Points

#### 1. Configuration

**Frontend → Backend**:
```typescript
// store.ts
import { createDefaultConfig } from 'tracejs';

class Store {
  readonly config = reactive(createDefaultConfig());

  // Deep clone to avoid Vue proxy overhead
  runSimulation() {
    const configCopy = JSON.parse(JSON.stringify(this.config));
    const sim = new TraceSim(configCopy);
    // ...
  }
}
```

**Why Deep Clone?**
- Vue's reactive proxies add performance overhead to TraceNet
- Deep clone creates plain JavaScript objects
- Simulation runs 30-50% faster without reactive proxies

---

#### 2. Simulation Execution

**Frontend Control Flow**:
```typescript
// SimulationToolbar.vue
const runSimulation = () => {
  store.runSimulation();  // Blocking, runs in main thread
};

// store.ts
runSimulation() {
  const configCopy = JSON.parse(JSON.stringify(this.config));
  const sim = new TraceSim(configCopy);
  sim.cycle(this.cyclesToCalculate.value);  // Synchronous
  this.sim.value = sim;  // Store result
}
```

**Note**: Simulation is synchronous and blocks the UI thread. This is intentional:
- Most simulations complete in < 1 second
- Simplifies state management (no async coordination)
- Users can see simulation complete before interacting with results

---

#### 3. Data Access

**Layer Data Extraction**:
```typescript
// Frontend accesses simulation data
const phonemeData = computed(() => {
  if (!store.sim.value) return null;
  return store.sim.value.getPhonemeData(currentCycle.value);
});

// Backend provides typed access
class TraceSimBase {
  getPhonemeData(cycle: number): number[][] {
    return this.phonLayer[cycle];
  }
}
```

**Serialization for Export**:
```typescript
// Frontend triggers export
const saveSimData = () => {
  const zip = new JSZip();

  // Use backend serialization methods
  zip.file('phoneme.csv', store.sim.value!.serializePhonemeData());
  zip.file('word.csv', store.sim.value!.serializeWordData());
  // ... more files

  zip.generateAsync({ type: 'blob' }).then((blob) => {
    saveAs(blob, 'simulation_data.zip');
  });
};
```

---

#### 4. Analysis Pipeline

**Frontend → Backend Analysis Flow**:
```typescript
// AnalysisChart.vue
const chartData = computed(() => {
  if (!store.sim.value) return null;

  // Use backend analysis functions
  const analysis = doSimAnalysis(
    store.analysisConfig,
    store.sim.value
  );

  return formatAnalysis(analysis, store.analysisConfig);
});

// tracejs exports
export function doSimAnalysis(
  config: TraceAnalysisConfig,
  sim: TraceSim
): TraceAnalysisResult {
  // Complex alignment calculations
  // Response probability transformations
  // Competition index computations
  // ...
}
```

---

#### 5. Error Handling

**Input Validation**:
```typescript
// ConfigInput.vue
const validateInput = (input: string) => {
  try {
    // Use backend validation
    const net = new TraceNet(store.config);
    // If construction succeeds, input is valid
    return { valid: true };
  } catch (error) {
    if (error instanceof ModelInputError) {
      return {
        valid: false,
        message: error.message
      };
    }
    throw error;
  }
};
```

---

### Module Loading

**Browser Environment**:
```typescript
// Frontend package.json
{
  "dependencies": {
    "tracejs": "*"  // Workspace package
  }
}

// Build process (Vite)
import { TraceSim } from 'tracejs';
// → Resolves to tracejs/dist/esm/index.js
// → Browser field mapping applied
// → Loads browser/trace-sim.js (no file I/O)
```

**Result**:
- Single bundle with tree-shaken tracejs code
- No Node.js dependencies in browser build
- Full TypeScript type checking

---

## User Interface and User Experience

### Overview

The tsTRACE web application provides a **single-page application (SPA)** interface built with Vue 3, featuring a clean, professional design using the Bulma CSS framework. The application uses a **tab-based navigation** system with **four primary tabs** at the top level, allowing users to configure the model, run simulations, analyze results, and export data—all without leaving the page.

**Critical Design Principle**: The application is designed so that **configuration and visualization remain on the same page**. Users can switch between tabs without losing context, and the simulation results persist across tab switches. This allows for an iterative workflow where users can:
1. Configure parameters (Config tab)
2. Run and visualize simulations (Simulation tab)
3. Analyze results with custom charts (Chart tab)
4. Export raw data (Data tab)

**Visual Design**:
- **Color Scheme**: Clean, minimal palette with light gray background (#fafafa), white content areas, and subtle borders (#dbdbdb)
- **Typography**: Bulma default font stack (system fonts for optimal readability)
- **Layout**: Full-height flex layout with fixed tab navigation and scrollable content
- **Responsive**: Grid-based layouts adapt to viewport size

---

### Application Shell

**Navigation Bar** (top of page):
```
┌────────────────────────────────────────────────────────────┐
│  Config [*]  │  Simulation  │  Chart  │  Data             │  ← Primary Tabs
└────────────────────────────────────────────────────────────┘
```

- **Four primary tabs**: Config, Simulation, Chart, Data
- **Active tab indicator**: Highlighted/underlined tab shows current view
- **Config change indicator**: Asterisk `[*]` appears on Config tab when parameters have been modified but simulation not yet re-run
- **Tab style**: Boxed tabs (Bulma `is-boxed` class) with clean borders

**Main Content Area**:
- **Background**: Light gray (#fafafa) for visual contrast
- **Scrollable**: Vertical overflow handled automatically
- **Full height**: Fills remaining viewport space below navigation

---

### Tab 1: Config

**Purpose**: Configure all TRACE model parameters, phonology, and lexicon.

**Sub-Tab Navigation**:
```
┌────────────────────────────────────────────────────────────┐
│ Config [*]  │  Simulation  │  Chart  │  Data              │  ← Primary tabs
└────────────────────────────────────────────────────────────┘
│  Parameters  │  Phonology  │  Lexicon                      │  ← Config sub-tabs
└────────────────────────────────────────────────────────────┘
```

The Config tab contains **three sub-tabs**: Parameters, Phonology, Lexicon.

---

#### Config > Parameters Sub-Tab

**Layout**: Two-column design
- **Left column (60%)**: Model input visualization (ConfigInput component)
- **Right column (40%)**: Parameter controls (scrollable)

**Model Input Section** (top of page):
```
┌─────────────────────────────────────────────────────────────┐
│ Model Input: [-^br^pt-]                     [Text input]   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │     [Feature Visualization Heatmap]                    │ │
│ │     - 63 rows (7 continua × 9 features)                │ │
│ │     - 99 columns (time slices)                         │ │
│ │     - Darker cells = higher feature values             │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- **Live validation**: Invalid phoneme symbols trigger error message
- **Real-time visualization**: Feature matrix updates as you type
- **Scrollable**: Horizontal scrollbar for full 99-slice view

**Continuum Specification** (below model input):
```
☑ Enable continuum
From phoneme: [p ▼]  To phoneme: [b ▼]  Steps: [5]
```

**Parameter Controls** (scrollable right column or below):

**1. Network Weights (ALPHA)**:
```
ALPHA (between-layer gain)
  IF (input → features):     [0.04] [reset]
  FP (features → phonemes):  [0.02] [reset]
  PW (phonemes → words):     [0.05] [reset]
  WP (words → phonemes):     [0.03] [reset]
  PF (phonemes → features):  [0.00] [reset]
```

**2. Lateral Inhibition (GAMMA)**:
```
GAMMA (lateral inhibition)
  F (feature level):   [0.04] [reset]
  P (phoneme level):   [0.04] [reset]
  W (word level):      [0.04] [reset]
```

**3. Decay Rates**:
```
DECAY
  F (feature):  [0.01] [reset]
  P (phoneme):  [0.03] [reset]
  W (word):     [0.05] [reset]
```

**4. Resting Levels**:
```
REST
  F (feature):  [-0.10] [reset]
  P (phoneme):  [-0.05] [reset]
  W (word):     [-0.05] [reset]
```

**5. Noise and Stochasticity**:
```
Input Noise SD:        [0.00] [reset]
Stochasticity SD:      [0.00] [reset]
```

**6. Advanced Parameters**:
```
Attention:             [0.00] [reset]
Bias:                  [0.00] [reset]
Spread Scale:          [1.00] [reset]
Length Normalization:  [0]    [reset]
```

**7. Activation Bounds**:
```
Min: [-0.3] [reset]
Max: [1.0]  [reset]
```

**8. Temporal Parameters**:
```
fSlices (time slices):        [99]  [reset]
deltaInput (phoneme spacing): [6]   [reset]
nreps (cycles per step):      [1]   [reset]
slicesPerPhon:                [3]   [reset]
```

**9. Feature Spread** (7 values, one per continuum):
```
FETSPREAD
  POW: [6] [reset]
  VOC: [6] [reset]
  DIF: [6] [reset]
  ACU: [6] [reset]
  GRD: [6] [reset]
  VOI: [6] [reset]
  BUR: [6] [reset]
```

**10. Frequency and Priming**:
```
Frequency (resting levels) s:        [0.00] [reset]
Frequency (phoneme→word weights) s:  [0.00] [reset]
Frequency (post activation) c:       [0.00] [reset]

Priming (resting levels) s:          [0.00] [reset]
Priming (phoneme→word weights) s:    [0.00] [reset]
Priming (post activation) c:         [0.00] [reset]
```

**Import/Export**:
```
[Load from JSON] [Save JSON]
```

**UI Notes**:
- **Reset buttons**: Appear next to each parameter when value differs from current config (not necessarily default)
- **Number inputs**: All parameter fields are `type="number"` with appropriate min/max/step
- **Compact layout**: Labels aligned left, inputs right-aligned

---

#### Config > Phonology Sub-Tab

**Purpose**: Edit the phoneme inventory (default: 15 phonemes).

**Layout**: Single scrollable table

**Header Controls**:
```
[Load from XML] [Save XML] [Add phoneme]
```

**Phoneme Table**:
```
┌──────┬───────────────────────────────────────────────────────────────────────┬───────────────────────┬────────┐
│Symbol│ Features (7 continua × 9 levels = 63 values)                          │ Duration Scalar (7)   │ Delete │
├──────┼───────────────────────────────────────────────────────────────────────┼───────────────────────┼────────┤
│ [p]  │ [0.0][0.0][0.0]...[1.0][0.0]...(63 input boxes)                      │ [1][1][1][1][1][1][1] │ [Del]  │
│ [b]  │ [0.0][0.0][0.0]...[0.8][0.0]...(63 input boxes)                      │ [1][1][1][1][1][1][1] │ [Del]  │
│ [t]  │ (63 input boxes)                                                      │ [1][1][1][1][1][1][1] │ [Del]  │
│ ...  │ ...                                                                   │ ...                   │ ...    │
└──────┴───────────────────────────────────────────────────────────────────────┴───────────────────────┴────────┘
```

**Features**:
- **Editable cells**: Click any phoneme symbol or feature value to edit
- **Add phoneme**: Creates new row with null symbol and all zeros
- **Delete**: Removes phoneme from inventory (no confirmation dialog—be careful!)
- **XML/JSON support**: Import/export phonology files compatible with jTRACE

**Column Details**:
- **Symbol**: Single character phoneme label (e.g., 'p', 'b', '^', '-')
- **Features**: 63 editable number inputs representing feature values across:
  - 7 continua: POW, VOC, DIF, ACU, GRD, VOI, BUR
  - 9 levels per continuum (0-8)
- **Duration Scalar**: 7 values (one per continuum) for temporal spreading
- **Delete**: Button to remove phoneme

---

#### Config > Lexicon Sub-Tab

**Purpose**: Manage the word lexicon (default: ~212 words).

**Header Controls**:
```
[Add word] [Load from XML] [Save XML]
```

**Lexicon Table**:
```
┌─────────────────┬──────────┬────────┬────────┐
│ Lexical Items   │Frequency │ Prime  │ Delete │
├─────────────────┼──────────┼────────┼────────┤
│ [^br^pt      ]  │ [37   ]  │ [0  ]  │ [Del]  │
│ [pr^|d^kt    ]  │ [216  ]  │ [0  ]  │ [Del]  │
│ [r^b         ]  │ [143  ]  │ [0  ]  │ [Del]  │
│ [...         ]  │ [...  ]  │ [...│  │ [...]  │
└─────────────────┴──────────┴────────┴────────┘
```

**Features**:
- **Editable cells**: Click to edit word phonology, frequency, or priming values
- **Add word**: Inserts new row at top with empty phonology, 0 frequency/prime
- **Delete**: Button to remove word (no confirmation)
- **XML/JSON support**: Import/export lexicon files

**Column Details**:
- **Lexical Items**: Phonological form using phoneme symbols (e.g., `^br^pt` for "abrupt")
- **Frequency**: Occurrences per million (used if frequency parameters enabled)
- **Prime**: Priming value (used if priming parameters enabled)
- **Delete**: Button per row, plus "Delete all" in header

**UI Notes**:
- **No validation**: Invalid phoneme symbols won't trigger errors until used in simulation
- **Scrollable**: Table height limited, vertical scroll for large lexicons

---

### Tab 2: Simulation

**Purpose**: Run simulations and visualize real-time network activations.

**Layout**: Full-screen 2×2 grid of charts with toolbar above

**Toolbar** (sticky at top):
```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Cycles to calculate: [60]  [Simulate]                                                      │
│                                                                                            │
│ Current cycle: [-] [0 ▼] [+] ————————○——— [start animation]                               │
│                                                                                            │
│ ☑ Visualize word/phoneme activations                          [Save sim data]             │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Toolbar Controls**:
1. **Cycles to calculate**: Number input (1-287)
2. **Simulate button**: Runs simulation (button darkens while processing)
3. **Current cycle controls** (appear after simulation):
   - **Minus button**: Decrement cycle
   - **Dropdown**: Select specific cycle (0 to N-1)
   - **Plus button**: Increment cycle
   - **Slider**: Drag to any cycle
   - **Start/stop animation**: Auto-advance through cycles
4. **Visualize checkbox**: Toggle between matrix charts and "box" charts
5. **Save sim data**: Download ZIP with all layer CSV files

**Model Input Display** (below toolbar):
```
Model Input: [-^br^pt-]  [editable text input]
```

**Chart Grid** (2×2 layout):
```
┌─────────────────────────────┬─────────────────────────────┐
│                             │                             │
│   Model Input               │   Feature Activations       │
│   (Matrix chart)            │   (Matrix chart)            │
│                             │                             │
├─────────────────────────────┼─────────────────────────────┤
│                             │                             │
│   Phoneme Activations       │   Word Activations          │
│   (Matrix or Box chart)     │   (Matrix or Box chart)     │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
```

**Chart Details**:

**1. Model Input (top-left)**:
- **Type**: Matrix/heatmap chart (Chart.js with custom controller)
- **Dimensions**: 63 rows (features) × 99 columns (time slices)
- **Color**: Black alpha channel (darker = higher input value)
- **Static**: Shows complete input pattern (doesn't change with cycle)
- **Title**: "Model Input"

**2. Feature Activations (top-right)**:
- **Type**: Matrix/heatmap chart
- **Dimensions**: 63 rows × 99 columns
- **Color**: Darker = higher activation
- **Updates**: Re-renders when current cycle changes
- **Title**: "Feature Activations"

**3. Phoneme Activations (bottom-left)**:
- **Matrix mode** (default):
  - 15 rows (phonemes) × 33 columns (phoneme time slices)
  - Each cell represents one copy of one phoneme
  - Darker = higher activation
- **Box mode** (when checkbox enabled):
  - Scatter plot with phoneme labels
  - Y-axis: Activation (0-1)
  - X-axis: Time slices
  - Phoneme text scaled to temporal extent
  - Only shows activations > 0.25
- **Title**: "Phoneme Activations"

**4. Word Activations (bottom-right)**:
- **Matrix mode** (default):
  - 10 rows (top 10 words by peak activation) × 33 columns
  - Each cell represents one copy of one word
  - Darker = higher activation
  - Top 10 can change per cycle
- **Box mode** (when checkbox enabled):
  - Scatter plot with word labels
  - Y-axis: Activation (0-1)
  - X-axis: Word time slices
  - Word text scaled to length (proportional to phoneme count)
  - Color-coded by activation rank (top 10)
  - Only shows activations > 0.25
- **Title**: "Word Activations"

**User Workflow**:
1. Enter or modify model input in text field
2. Set cycles to calculate
3. Click "Simulate" (button outline darkens during processing)
4. When complete, toolbar updates with cycle controls
5. Use slider/dropdown/buttons to navigate through cycles
6. Toggle checkbox to switch between matrix and box views
7. Optionally run animation to auto-advance
8. Click "Save sim data" to export results

**Visual Feedback**:
- **Simulation in progress**: Button outline darkens
- **Simulation complete**: Cycle controls appear, charts render
- **Invalid input**: Toolbar shows error message instead of controls

---

### Tab 3: Chart

**Purpose**: Advanced analysis with customizable chart configurations.

**Layout**: Two-column design
- **Left sidebar (15rem width)**: Analysis configuration panel
- **Right main area**: Large analysis chart

**Toolbar** (top):
```
┌────────────────────────────────────────────────────────────┐
│ Cycles to calculate: [60]  [Simulate]       [Save sim data]│
└────────────────────────────────────────────────────────────┘
```

**Layout Diagram**:
```
┌──────────────┬─────────────────────────────────────────────┐
│              │                                             │
│  Analysis    │                                             │
│  Config      │          Large Analysis Chart               │
│  Panel       │          (Scatter/Line Chart)               │
│  (sidebar)   │                                             │
│              │                                             │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

**Analysis Configuration Panel** (left sidebar):
```
┌────────────────────────────────────┐
│ NOTE: if chart doesn't appear,     │
│ try resizing browser window        │
│                                    │
│ [Refresh chart]                    │
│                                    │
│ Analyze                            │
│ ○ Words  ○ Phonemes                │
│                                    │
│ Content                            │
│ [Activations ▼]                    │
│   - Activations                    │
│   - Response Probabilities         │
│   - Competition Index              │
│                                    │
│ Items                              │
│ ○ Use top [10] items               │
│ ○ Use selected items               │
│   ☐ Exclude silence                │
│                                    │
│ Alignment Calculation              │
│ ○ Specified                        │
│ ○ Max (Post-Hoc)                   │
│                                    │
│ Alignment                          │
│ [4]                                │
│                                    │
│ Luce Choice (if Response Prob)     │
│ ○ All items  ○ Forced choice       │
│ k value: [7]                       │
│                                    │
│ Competition Index (if selected)    │
│ Type: [Raw ▼]                      │
│   - Raw                            │
│   - First-Derivative               │
│   - Second-Derivative              │
│ Sample width: [3]                  │
│                                    │
└────────────────────────────────────┘
```

**Configuration Options**:

1. **Refresh chart button**: Forces chart re-render (needed due to Chart.js bug)

2. **Analyze (Domain)**:
   - Radio buttons: Words or Phonemes
   - Determines which layer to analyze

3. **Content (Type)**:
   - Dropdown: Activations, Response Probabilities, Competition Index
   - Changes Y-axis meaning and calculations

4. **Items** (what to include):
   - **Use top N**: Number input (default: 10)
     - Checkbox: Exclude silence
   - **Use selected items** (Words only):
     - Shows scrollable list of all words with checkboxes
     - User selects specific words to include

5. **Alignment Calculation**:
   - **Specified**: Use fixed alignment value (see below)
   - **Max (Post-Hoc)**: Find best alignment per word across entire simulation

6. **Alignment** (if "Specified" selected):
   - Number input: Temporal alignment position (default: 4)

7. **Luce Choice** (appears when "Response Probabilities" selected):
   - Radio: All items or Forced choice
   - k value: Number input (scaling constant)

8. **Competition Index** (appears when "Competition Index" selected):
   - Type dropdown: Raw, First-Derivative, Second-Derivative
   - Sample width: Number input (for derivative smoothing)

**Analysis Chart** (right main area):
- **Type**: Scatter/line chart (Chart.js)
- **X-axis**: Cycles (0 to N-1)
- **Y-axis**: Activation / Response Probability / Competition Index
- **Legend**: Top of chart, shows item labels with alignments (e.g., "^br^pt [4]")
- **Multi-series**: Up to 22 items with unique colors
- **Responsive**: Fills available space

**User Workflow**:
1. Run simulation (or use existing simulation from Simulation tab)
2. Configure analysis parameters in left panel
3. Click "Refresh chart" to update
4. Examine trajectories over time
5. Adjust parameters and refresh as needed
6. Switch to Data tab to export chart data

---

### Tab 4: Data

**Purpose**: View and export raw simulation data in tabular format.

**Layout**: Sub-tab navigation with data tables

**Sub-Tab Navigation**:
```
┌────────────────────────────────────────────────────────────────────────┐
│ Data                                                                   │
├────────────────────────────────────────────────────────────────────────┤
│ Chart │ Input │ Feature │ Phoneme │ Word │ Levels and Flow            │
└────────────────────────────────────────────────────────────────────────┘
```

**Six sub-tabs**: Chart, Input, Feature, Phoneme, Word, Levels and Flow

---

#### Data > Chart Sub-Tab

**Content**: Shows the exact data used to generate the chart on the Chart tab.

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│ Cycles to calculate: [60]  [Simulate]   [Save sim data]   │
└────────────────────────────────────────────────────────────┘

cycle   ^br^pt [4]   r^b [2]   ^b [4]   ...
0       0.000000     0.000000  0.000000 ...
1       0.012345     0.001234  0.002345 ...
2       0.023456     0.002345  0.003456 ...
...
```

**Features**:
- **Tab-separated values**: Easy to copy-paste into Excel/R/Python
- **Column 1**: Cycle number
- **Remaining columns**: One per analyzed item (with alignment in brackets)
- **No cycle navigation**: Shows all cycles at once
- **Scrollable**: Vertical and horizontal scroll

---

#### Data > Input Sub-Tab

**Content**: Model input layer data (pseudo-spectral features).

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│ Cycles to calculate: [60]  [Simulate]   [Save sim data]   │
│ Current cycle: [-] [0 ▼] [+] ————————○———                 │
└────────────────────────────────────────────────────────────┘

cycle [modelInput] input label 0      1      2      ... 98
0     -^br^pt-     input POW_0 0.0000 0.0000 0.0000 ... 0.0000
0     -^br^pt-     input POW_1 0.0000 0.0000 0.0000 ... 0.0000
...
```

**Features**:
- **Cycle navigation**: Same controls as Simulation tab (but input doesn't change per cycle)
- **63 rows**: One per feature (7 continua × 9 features)
- **99 columns**: One per time slice

---

#### Data > Feature Sub-Tab

**Content**: Feature layer activations.

**Layout**: Same as Input, but values change per cycle
```
cycle [modelInput] feature label 0      1      2      ... 98
0     -^br^pt-     feature POW_0 -0.100 -0.100 -0.100 ... -0.100
1     -^br^pt-     feature POW_0 -0.098 -0.099 -0.100 ... -0.100
...
```

**Features**:
- **Cycle navigation**: Shows selected cycle only
- **63 rows**: One per feature
- **99 columns**: One per time slice

---

#### Data > Phoneme Sub-Tab

**Content**: Phoneme layer activations.

**Layout**:
```
cycle [modelInput] phoneme label 0      1      2      ... 32
0     -^br^pt-     phoneme p     -0.050 -0.050 -0.050 ... -0.050
0     -^br^pt-     phoneme b     -0.050 -0.050 -0.050 ... -0.050
...
```

**Features**:
- **Cycle navigation**: Shows selected cycle only
- **15 rows**: One per phoneme (default)
- **33 columns**: One per phoneme time slice

---

#### Data > Word Sub-Tab

**Content**: Word layer activations.

**Layout**:
```
cycle [modelInput] word label     0      1      2      ... 32
0     -^br^pt-     word  ^br^pt   -0.050 -0.050 -0.050 ... -0.050
0     -^br^pt-     word  pr^|d^kt -0.050 -0.050 -0.050 ... -0.050
...
```

**Features**:
- **Cycle navigation**: Shows selected cycle only
- **212 rows**: One per word (default lexicon)
- **33 columns**: One per word time slice

---

#### Data > Levels and Flow Sub-Tab

**Content**: Global network metrics per cycle.

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│ Cycles to calculate: [60]  [Simulate]   [Save sim data]   │
└────────────────────────────────────────────────────────────┘

cycle FeatureSumAll FeatSumPos FeatureCompetition ... WordToPhonSum
0     -6.30000      0.00000    0.00000            ... 0.00000
1     -6.29370      0.06300    0.00252            ... 0.00030
...
```

**Features**:
- **No cycle navigation**: Shows all cycles at once
- **13 data columns**:
  1. FeatureSumAll
  2. FeatSumPos
  3. FeatureCompetition
  4. PhonSumAll
  5. PhonSumPos
  6. PhonemeCompetition
  7. WordSumAll
  8. WordSumPos
  9. LexicalCompetition
  10. FeatToPhonSum
  11. PhonToFeatSum
  12. PhonToWordSum
  13. WordToPhonSum
- **One row per cycle**

---

### Common UI Patterns

**Buttons** (Bulma styling):
- **Primary actions**: `.button` class with default styling
- **Hover effect**: Slight darkening
- **Active state**: Darker outline while processing

**Inputs**:
- **Text inputs**: `.input` class (Bulma)
- **Number inputs**: Width set based on expected value range
- **Dropdowns**: `.select` wrapper with `<select>` element
- **Checkboxes**: `.checkbox` label wrapper
- **Radio buttons**: `.radio` label wrapper
- **Sliders**: `.slider` class (HTML5 range input)

**Tables**:
- **Tab-separated output**: Plain text format for easy copying
- **Editable tables** (Config tabs): Input elements in cells
- **Read-only tables** (Data tabs): Plain text content

**Charts**:
- **No animations**: Performance optimization (Chart.js `animation: false`)
- **No tooltips**: Disabled for performance
- **No hover effects**: Disabled for performance
- **Responsive**: Fill container with `maintainAspectRatio: true`

**Layout**:
- **Flex containers**: All major layout sections use flexbox
- **Grid layouts**: Charts use CSS Grid (2×2, or 2-column)
- **Full height**: Application fills viewport (`height: 100%`)
- **Scrollable sections**: Overflow handled per section

---

### Responsive Behavior

**Desktop (primary target)**:
- **Minimum width**: ~1024px recommended
- **2×2 chart grid**: Full visibility of all charts
- **Sidebar layouts**: Adequate space for controls + chart

**Tablet**:
- **Charts stack**: May become difficult to view with small viewports
- **Tables scroll**: Horizontal scroll for wide data tables

**Mobile**:
- **Not optimized**: Application designed for desktop research use
- **Functional but cramped**: All features work but UI is crowded

---

### Accessibility Considerations

**Current State** (as of v1.0):
- **Keyboard navigation**: Partial support (native HTML form elements)
- **Screen readers**: Limited support (no ARIA labels)
- **Color contrast**: Good (Bulma defaults meet WCAG AA)
- **Focus indicators**: Browser defaults (visible)

**Areas for Improvement**:
- Add ARIA labels to charts
- Improve keyboard shortcuts for tab navigation
- Add skip links for accessibility
- Test with screen readers

---

### User Experience Flow Example

**Typical Research Workflow**:

1. **Configure Model** (Config tab):
   - Modify model input: `-slit-` → `-split-`
   - Adjust parameters: Increase word competition (`gamma.W = 0.06`)
   - Config tab shows `[*]` indicator

2. **Run Simulation** (Simulation tab):
   - Set cycles: `80`
   - Click "Simulate"
   - Watch charts update with final cycle (79)

3. **Explore Results** (Simulation tab):
   - Drag slider to cycle 40
   - See phoneme activations build up
   - Toggle "Visualize" checkbox to see box chart
   - Drag to cycle 70 to see word competition

4. **Analyze Trajectories** (Chart tab):
   - Select "Words" domain
   - Choose "Response Probabilities" content type
   - Set k value: `7`
   - Use top 10 items, exclude silence
   - Click "Refresh chart"
   - Examine probability curves over time

5. **Export Data** (Data tab):
   - Navigate to Word sub-tab
   - Review cycle 70 activations
   - Click "Save sim data"
   - Download ZIP with all layer CSVs

6. **Iterate** (return to Config tab):
   - Increase `alpha.WP` (top-down feedback)
   - Return to Simulation tab
   - Click "Simulate" to re-run
   - Compare new results

**Key UX Principles**:
- **Context preservation**: Simulation persists across tabs
- **No page reloads**: All interactions within SPA
- **Immediate feedback**: Button states, chart updates
- **Flexible exploration**: Multiple ways to view same data
- **Data export**: All data accessible as CSV

---

### Critical Design Insight for Developers

**IMPORTANT**: When implementing features or modifications to this application, remember that **the entire workflow happens within a single page**. Do NOT create separate pages or forms that isolate configuration from visualization.

**Anti-Pattern to Avoid**:
```
❌ BAD: Separate config page → Submit form → Results page
```

**Correct Pattern**:
```
✓ GOOD: Tab 1 (Config) → Tab 2 (Simulation with live charts) → Tab 3 (Analysis charts)
        All within same page, shared state, no navigation away
```

**Why This Matters**:
- **Iterative research**: Scientists need to tweak parameters and immediately see effects
- **Comparison**: Users often switch between Simulation and Chart tabs to see different views of same data
- **Context**: Config changes are visible across all tabs (asterisk indicator)
- **Export**: Data tab shows results from current simulation without re-running

This design allows for **rapid experimentation** and **exploratory analysis**, which is essential for computational modeling research.

---

## Data Flow

### User Workflow: Running a Simulation

```
┌─────────────────────────────────────────────────────────┐
│ 1. User configures parameters in Config tab             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Config changes tracked via reactive store            │
│    - store.config updated                               │
│    - configHash computed property updates               │
│    - Config tab shows asterisk (*)                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. User navigates to Simulation tab                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. User clicks "Simulate" button                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend calls store.runSimulation()                 │
│    - Deep clone config to avoid reactive overhead       │
│    - const sim = new TraceSim(configCopy)               │
│    - sim.cycle(numCycles)                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Backend executes simulation (synchronous)            │
│    - TraceNet.cycle() × numCycles                       │
│    - Activation spreading through layers                │
│    - Data collected in TraceSimBase arrays              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Simulation complete, stored in store.sim             │
│    - Button outline returns to normal                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Charts reactively update                             │
│    - Computed properties re-evaluate                    │
│    - Chart.js receives new data                         │
│    - Visualizations render                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 9. User interacts with results                          │
│    - Cycle slider updates current cycle                 │
│    - Charts reactively update to show cycle data        │
│    - Animation mode auto-advances through cycles        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 10. User navigates to Chart tab for analysis            │
│    - Configured analysis parameters                     │
│    - Click "Refresh chart"                              │
│    - doSimAnalysis(config, sim) called                  │
│    - Analysis chart renders                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 11. User exports data                                   │
│    - Click "Save sim data"                              │
│    - Backend serializes all layers to CSV strings       │
│    - Frontend creates ZIP archive                       │
│    - Browser downloads simulation_data.zip              │
└─────────────────────────────────────────────────────────┘
```

---

## Key Algorithms and Models

### TRACE Interactive Activation Model

#### Conceptual Overview

TRACE models speech perception as a dynamic process of parallel activation spreading through three levels:

1. **Feature Layer**: Acoustic-phonetic features (7 continua × 9 features = 63 units per slice)
2. **Phoneme Layer**: Phonological units (15 phonemes × 33 time slices = 495 units)
3. **Word Layer**: Lexical units (212 words × 33 time slices = 6996 units)

**Key Principles**:
- **Bottom-up activation**: Lower levels activate higher levels
- **Top-down feedback**: Higher levels activate lower levels
- **Lateral inhibition**: Units within a layer compete
- **Temporal representation**: Units replicated across time slices

---

#### Activation Dynamics

**Update Equation**:
```
New activation = Old activation + Net input effect + Decay effect + Noise

Where:
  Net input effect = {
    (max - activation) * net   if net > 0 (excitation)
    (activation - min) * net   if net ≤ 0 (inhibition)
  }

  Decay effect = -decay * (activation - rest)

  Noise ~ N(0, stochasticitySD)

  Final activation = clamp(New activation, min, max)
```

**Interpretation**:
- Positive net input pushes activation toward max
- Negative net input pushes activation toward min
- Decay pulls activation toward resting level
- Noise adds variability

---

#### Information Flow

**Per Cycle (6-step process within each cycle)**:

```
Step 1: actFeatures()
  Input → Features
  Features ↔ Features (lateral inhibition)

Then repeat 'nreps' times (default: 1):

Step 2: featToPhon()
  Features → Phonemes (bottom-up excitation)

Step 3: phonToPhon()
  Phonemes ↔ Phonemes (lateral inhibition)

Step 4: phonToWord()
  Phonemes → Words (bottom-up excitation)

Step 5: wordToPhon()
  Words → Phonemes (top-down feedback)

Step 6: wordToWord()
  Words ↔ Words (lateral inhibition with length normalization)

After each step: Update activations (decay, noise, clamping)
```

---

#### Temporal Alignment

**Challenge**: How does the model represent temporal order?

**Solution**: Replicate units across time slices

```
Phoneme Layer (example):
Slice: 0  1  2  3  4  5  6  7  8  9  10 ...
  /k/: k  k  k  k  k  k  k  k  k  k  k  ...
  /a/: a  a  a  a  a  a  a  a  a  a  a  ...
  /t/: t  t  t  t  t  t  t  t  t  t  t  ...

For input /kat/:
  /k/ most active at slices 0-2
  /a/ most active at slices 3-5
  /t/ most active at slices 6-8
```

**Word Layer** (dynamic length):
```
Word "cat" (/kat/):
  Alignment 0: spans slices 0-8
  Alignment 1: spans slices 1-9
  Alignment 2: spans slices 2-10
  ...

Each alignment is a separate unit that receives input
from phonemes at its aligned positions.
```

---

#### Lateral Inhibition

**Within-Layer Competition**:

```
For each unit with activation > 0:
  Send inhibition to all overlapping units (except self)

Inhibition calculation:
  Total_inhibition[slice] = sum(activation[i] * gamma for all i at slice)

  For each unit at slice:
    Net_input -= Total_inhibition[slice]
    Net_input += self_activation * gamma  // Compensate for self-inhibition
```

**Temporal Overlap**:
- Phonemes: Same time slice
- Words: Any overlapping time slices

**Special Cases**:
- Units do not inhibit other copies of themselves (e.g., CAT[4] doesn't inhibit CAT[5])
- Longer words receive more inhibition (more overlap opportunities)

---

#### Length Normalization (Experimental)

**Problem**: Longer words inherently receive more inhibition

**Solution** (optional):
```
If enabled:
  L_mean = mean word length in lexicon
  β = 1 / L_mean

  For word of length L:
    If β * L > 1 (longer than average):
      Inhibition = Inhibition / (β * L)
    Else:
      No change
```

---

#### Response Probability (Luce Choice Rule)

**Purpose**: Convert activations to behavioral predictions

**Algorithm**:
```
Step 1: Calculate response strengths
  S_i = exp(k * activation_i)

  Optional frequency scaling:
    S_i *= log10(c + frequency_i)

Step 2: Normalize to probabilities
  P_i = S_i / sum(S_j for all j)
```

**Parameters**:
- k: Scaling constant (typical: 5-10)
- c: Frequency offset (typical: 1)

---

#### Competition Index

**Purpose**: Quantify total competition within a layer

**Calculation**:
```
Raw:
  CI[cycle] = sum of all inhibition sent within layer

First Derivative (rate of change):
  CI'[cycle] = slope of CI over sample window

  Where slope = sum((x - mean_x)(y - mean_y)) / sum((x - mean_x)^2)

Second Derivative (acceleration):
  CI''[cycle] = slope of CI'
```

**Use Case**: Correlate with neural activity (e.g., EEG/MEG)

---

### Phoneme Continua

**Purpose**: Create interpolated phonemes for categorical perception experiments

**Example**: /b/ to /p/ continuum (voicing)

```
Steps = 5
Continuum: [0, 1, 2, 3, 4]

Phoneme 0: 100% /b/, 0% /p/
Phoneme 1: 75% /b/, 25% /p/
Phoneme 2: 50% /b/, 50% /p/
Phoneme 3: 25% /b/, 75% /p/
Phoneme 4: 0% /b/, 100% /p/

Features interpolated linearly across all 63 dimensions
```

---

## File Formats and Data Structures

### Configuration JSON

**Purpose**: Save/load complete model configuration

**Example**:
```json
{
  "modelInput": "-^br^pt-",
  "fSlices": 99,
  "deltaInput": 6,
  "slicesPerPhon": 3,
  "nreps": 1,
  "alpha": {
    "IF": 0.04,
    "FP": 0.02,
    "PW": 0.05,
    "WP": 0.03,
    "PF": 0.0
  },
  "gamma": {
    "F": 0.04,
    "P": 0.04,
    "W": 0.04
  },
  "decay": {
    "F": 0.01,
    "P": 0.03,
    "W": 0.05
  },
  "rest": {
    "F": -0.1,
    "P": -0.05,
    "W": -0.05
  },
  "spread": [6, 6, 6, 6, 6, 6, 6],
  "min": -0.3,
  "max": 1.0,
  "noiseSD": 0.0,
  "stochasticitySD": 0.0,
  "freqNode": {
    "RDL_wt_s": 0.0,
    "RDL_rest_s": 0.0,
    "RDL_post_c": 0.0
  },
  "lexicon": [ /* ... */ ],
  "phonology": [ /* ... */ ]
}
```

---

### Lexicon XML (jTRACE format)

**Purpose**: Import/export word lists with frequency and priming

**Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<lexicon>
  <lexeme>
    <label>abrupt</label>
    <phonology>^br^pt</phonology>
    <frequency>37</frequency>
    <prime>0</prime>
  </lexeme>
  <lexeme>
    <label>product</label>
    <phonology>prad^kt</phonology>
    <frequency>216</frequency>
  </lexeme>
</lexicon>
```

**Fields**:
- `label`: Word orthography
- `phonology`: Phoneme sequence (using phonology symbols)
- `frequency`: Occurrences per million (optional, default: 0)
- `prime`: Priming value (optional, default: 0)

---

### Phonology XML

**Purpose**: Define phoneme inventory and features

**Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phonology>
  <phonemes>
    <phoneme>
      <symbol>p</symbol>
      <features>
        0.0 0.0 0.0 0.0 1.0 0.0 0.0 0.0 0.0
        0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
        0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
        0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
        0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
        0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
        0.0 0.0 0.0 0.0 0.0 0.0 0.0 1.0 0.0
      </features>
      <durationScalar>1 1 1 1 1 1 1</durationScalar>
    </phoneme>
    <!-- More phonemes... -->
  </phonemes>
</phonology>
```

**Fields**:
- `symbol`: Phoneme label (e.g., 'p', 'b', '^')
- `features`: 63 values (7 continua × 9 features)
- `durationScalar`: 7 values (currently not fully implemented)

---

### Simulation Data CSV

**Purpose**: Export layer activations for external analysis

**Format**: Tab-separated values (TSV) despite .csv extension

**Phoneme Data Example**:
```
cycle	[modelInput]	phoneme	label	0	1	2	3	4	5	...	32
0	-^br^pt-	phoneme	p	-0.0500	-0.0500	-0.0500	-0.0500	-0.0500	...
0	-^br^pt-	phoneme	b	-0.0500	-0.0500	-0.0500	-0.0500	-0.0500	...
1	-^br^pt-	phoneme	p	-0.0495	-0.0495	-0.0495	-0.0495	-0.0495	...
```

**Columns**:
- `cycle`: Time step (0 to numCycles-1)
- `[modelInput]`: Input string (for record-keeping)
- `phoneme` or `word`: Layer type
- `label`: Unit label (phoneme/word symbol)
- `0` to `32`: Activation at each time slice (33 default)

---

### Levels and Flow CSV

**Purpose**: Track global network activity

**Example**:
```
cycle	FeatureSumAll	FeatSumPos	FeatureCompetition	PhonSumAll	PhonSumPos	PhonemeCompetition	WordSumAll	WordSumPos	LexicalCompetition	FeatToPhonSum	PhonToFeatSum	PhonToWordSum	WordToPhonSum
0	-6.30000	0.00000	0.00000	-16.50000	0.00000	0.00000	-1060.00000	0.00000	0.00000	0.00000	0.00000	0.00000	0.00000
1	-6.29370	0.06300	0.00252	-16.33500	0.16500	0.00660	-1059.00000	1.00000	0.04000	0.00140	0.00000	0.00050	0.00030
```

**Columns**:
1. `FeatureSumAll`: Sum of all feature activations
2. `FeatSumPos`: Sum of positive feature activations
3. `FeatureCompetition`: Total feature-layer inhibition
4. `PhonSumAll`: Sum of all phoneme activations
5. `PhonSumPos`: Sum of positive phoneme activations
6. `PhonemeCompetition`: Total phoneme-layer inhibition
7. `WordSumAll`: Sum of all word activations
8. `WordSumPos`: Sum of positive word activations
9. `LexicalCompetition`: Total word-layer inhibition
10. `FeatToPhonSum`: Total activation flow from features to phonemes
11. `PhonToFeatSum`: Total activation flow from phonemes to features
12. `PhonToWordSum`: Total activation flow from phonemes to words
13. `WordToPhonSum`: Total activation flow from words to phonemes

---

## Development Environment

### Prerequisites

- **Node.js**: v14+ (recommend v16+)
- **Yarn**: v1.22+
- **nvm** (recommended): For Node.js version management

### Installation

```bash
# Clone repository
git clone https://github.com/andrew0/tracejs
cd tracejs

# Install dependencies (all packages)
yarn install

# Build tracejs backend
yarn build
```

### Monorepo Structure (Yarn Workspaces)

```json
// Root package.json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "yarn workspace tracejs build",
    "cli": "yarn workspace tracejs cli",
    "vue-dev": "yarn workspace tracejs-vue dev",
    "vue-build": "yarn workspace tracejs-vue build"
  }
}
```

**Benefits**:
- Shared dependencies (single `node_modules`)
- Cross-package imports (`import { TraceSim } from 'tracejs'`)
- Unified scripts at root level

---

### Development Workflows

#### Backend Development

```bash
# Build tracejs
yarn build

# Watch mode (rebuild on changes)
cd packages/tracejs
yarn build --watch

# Run tests
yarn test

# Run CLI/REPL
yarn cli

# Run playground script
cd packages/playground
node index.js
```

---

#### Frontend Development

```bash
# Start dev server (with hot reload)
yarn vue-dev

# Build for production
yarn vue-build

# Preview production build
cd packages/tracejs-vue/dist
npx http-server
```

**Dev Server Features**:
- Hot Module Replacement (HMR)
- Fast refresh on file changes
- TypeScript type checking
- Auto-open browser to http://localhost:5173/tracejs/

---

#### Playground Usage

```javascript
// packages/playground/index.js
const tracejs = require('tracejs');

const config = tracejs.createDefaultConfig();
config.modelInput = '-slit-';

const sim = new tracejs.TraceSim(config);
sim.cycle(60);

console.log('Final word activations:');
console.log(sim.getWordData(59));
```

---

### Testing

**Framework**: Jest + ts-jest

**Test Files**: `packages/tracejs/src/__tests__/*.test.ts`

**Strategy**: Regression testing with snapshots

```typescript
// Example test
test('output does not change unexpectedly', () => {
  const config = createDefaultConfig();
  const sim = new TraceSim(config);
  sim.cycle(15);
  expect(sim.getAllWordData()).toMatchSnapshot();
});
```

**Run Tests**:
```bash
cd packages/tracejs
yarn test
```

---

### Code Formatting

**Tool**: Prettier

**Configuration**:
```json
{
  "singleQuote": true,
  "printWidth": 100
}
```

**Usage**:
```bash
# Format all files
yarn lint

# Check formatting
npx prettier --check .
```

---

## Deployment Architecture

### GitHub Pages Deployment

**URL**: https://andrew0.github.io/tracejs/

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│         GitHub Pages (Static Hosting)                    │
│                                                          │
│  /tracejs/                                              │
│  ├─ index.html                                          │
│  ├─ assets/                                             │
│  │  ├─ index-[hash].js   (Vue app + tracejs bundled)   │
│  │  ├─ index-[hash].css  (Bulma + custom styles)       │
│  │  └─ vendor-[hash].js  (Chart.js, etc.)              │
│  └─ favicon.ico                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Build Process**:
```bash
# 1. Build tracejs backend
yarn build

# 2. Build Vue frontend
yarn vue-build

# 3. Output to packages/tracejs-vue/dist/
# 4. Deploy dist/ to gh-pages branch
```

**Vite Configuration for GitHub Pages**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/tracejs/',  // Matches GitHub Pages subdirectory
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['chart.js', 'file-saver']
        }
      }
    }
  }
});
```

---

### Static Asset Optimization

**Vite Optimizations**:
- Code splitting (vendor chunks)
- Tree shaking (remove unused code)
- Minification (Terser)
- Hashed filenames (cache busting)
- Preload/prefetch directives

**Bundle Sizes** (approximate):
- `index-[hash].js`: ~150 KB (gzipped)
- `vendor-[hash].js`: ~100 KB (gzipped)
- Total: ~250 KB (gzipped)

---

### Browser Compatibility

**Target**: Modern browsers (ES2015+)

**Supported**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Not Supported**:
- Internet Explorer (any version)
- Legacy browsers without ES6 module support

---

## Performance Considerations

### Backend Performance

#### 1. Simulation Speed

**Typical Performance** (on modern hardware):
- 60 cycles: ~100-200 ms
- 287 cycles: ~400-800 ms

**Factors**:
- Network size (lexicon size × time slices)
- nreps parameter (repetitions per cycle)
- Noise calculation overhead

**Optimizations**:
- Typed arrays for layer storage
- Pre-allocated arrays (avoid GC)
- Minimal object creation in hot loops

---

#### 2. Memory Usage

**Per Simulation**:
- Input: `63 × 99 × 8 bytes` = ~50 KB
- Features: `63 × 99 × numCycles × 8 bytes` = ~3 MB (60 cycles)
- Phonemes: `15 × 33 × numCycles × 8 bytes` = ~240 KB (60 cycles)
- Words: `212 × 33 × numCycles × 8 bytes` = ~3.4 MB (60 cycles)
- **Total**: ~7 MB per simulation

**Browser Limit**: ~1-2 GB (varies by browser)

**Max Simulations in Memory**: ~100-200 before memory pressure

---

### Frontend Performance

#### 1. Reactive State Overhead

**Problem**: Vue's reactive proxies add ~30-50% overhead to TraceNet

**Solution**: Deep clone config before simulation

```typescript
// BAD: Pass reactive object
const sim = new TraceSim(this.config);  // Reactive proxy

// GOOD: Deep clone to plain object
const configCopy = JSON.parse(JSON.stringify(this.config));
const sim = new TraceSim(configCopy);  // Plain object
```

---

#### 2. Chart Rendering

**Optimizations**:
- Disable animations (`animation: false`)
- Disable hover effects (`hover: { mode: null }`)
- Disable tooltips (`tooltips: { enabled: false }`)
- Limit box charts to top 10 items

**Matrix Chart Performance**:
- 63 features × 99 slices = 6,237 cells
- Renders in ~50-100 ms

**Box Chart Performance**:
- Top 10 words only
- Text rendering overhead (~100-200 ms)

---

#### 3. Data Table Rendering

**Problem**: Rendering 200+ words × 33 slices = 6,600+ cells

**Optimizations**:
- Virtual scrolling (not currently implemented)
- Tab-separated text (avoid HTML table overhead)
- Lazy loading (load on tab switch)

---

### Optimization Recommendations

**For Large Simulations**:
1. Reduce `fSlices` (99 → 60)
2. Reduce lexicon size (filter to relevant words)
3. Lower `cyclesToCalculate` (287 → 100)
4. Disable stochasticity (`stochasticitySD = 0`)

**For Smooth Animation**:
1. Use matrix charts (faster than box charts)
2. Limit animation to critical cycles
3. Use slider for precise navigation

---

## Security Considerations

### Client-Side Only Architecture

**Security Posture**:
- **No server-side code**: Eliminates server attack surface
- **No database**: No injection vulnerabilities
- **No authentication**: No credential management
- **Static hosting**: Limited attack vectors

**Threats Mitigated**:
- SQL injection: N/A (no database)
- XSS: Low risk (no user-generated content stored/displayed)
- CSRF: N/A (no state-changing operations)
- Authentication bypass: N/A (no authentication)

---

### File Upload Risks

**User File Uploads**:
- Lexicon XML/JSON
- Phonology XML/JSON
- Configuration JSON

**Mitigations**:
1. **Client-side parsing only**: Files never sent to server
2. **XML parser safety**: fast-xml-parser with safe defaults
3. **Type validation**: typanion validates JSON structure
4. **Error handling**: Catch and display parse errors

**Remaining Risks**:
- Malicious XML (XXE): Mitigated by parser configuration
- JSON injection: Mitigated by type validation
- DOS via large files: Mitigated by browser memory limits

---

### Content Security Policy (CSP)

**Recommendation** (not currently implemented):
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';">
```

**Why not implemented?**:
- GitHub Pages doesn't support custom headers
- Would require `unsafe-inline` for Chart.js anyway

---

### Data Privacy

**User Data**:
- All processing happens client-side
- No data sent to external servers
- No analytics/tracking (by default)
- No cookies

**Exported Data**:
- Simulation results downloaded directly to user's machine
- No server-side storage

---

## Future Enhancements

### Planned Features (from jTRACE)

1. **Gallery of Classic Simulations**
   - Pre-configured simulations from published papers
   - One-click replication of famous TRACE results
   - Educational tool for learning the model

2. **JavaScript Code Repository**
   - Example scripts for batch simulations
   - Parameter exploration templates
   - Documentation for programmatic usage

3. **Enhanced Scripting**
   - In-browser scripting interface
   - Real-time script execution
   - Script sharing/export

---

### Potential Improvements

#### Backend

1. **WebAssembly Port**
   - Compile core simulation to WASM
   - 2-5× performance improvement
   - Still accessible from JavaScript

2. **Worker Thread Support**
   - Run simulations in background thread
   - Non-blocking UI during long simulations
   - Progress reporting

3. **Streaming Data Export**
   - Incremental CSV writing for large simulations
   - Reduce memory pressure

4. **Additional Analysis Methods**
   - More alignment strategies
   - Statistical tests (t-tests, ANOVAs)
   - Automated model fitting

---

#### Frontend

1. **Virtual Scrolling**
   - Handle large lexicons (1000+ words)
   - Smooth scrolling in data tables

2. **Advanced Charting**
   - Zoom/pan interactions
   - Custom data export from charts
   - 3D visualizations (feature × time × activation)

3. **Comparison Mode**
   - Side-by-side simulation comparison
   - Parameter diff visualization
   - Statistical comparison tools

4. **Mobile Support**
   - Responsive layout for tablets/phones
   - Touch-friendly controls
   - Simplified mobile UI

5. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

---

### Research Extensions

1. **Extended Lexicons**
   - Support for 10,000+ word lexicons
   - Lexicon loading from external databases
   - Automatic frequency extraction (SUBTLEX, etc.)

2. **Neural Network Extensions**
   - Attention mechanisms
   - Predictive coding
   - Bayesian inference

3. **Integration with Experimental Tools**
   - Direct import of experimental materials
   - Automatic model fitting to behavioral data
   - Simulation-experiment comparison dashboards

---

## Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **TRACE** | Interactive activation model of speech perception (McClelland & Elman, 1986) |
| **jTRACE** | Java implementation of TRACE (Strauss et al., 2007) |
| **cTRACE** | Original C implementation of TRACE |
| **tsTRACE/jsTRACE** | TypeScript/JavaScript implementation (this project) |
| **Interactive Activation** | Neural network architecture with bidirectional connections |
| **Pseudo-spectral** | Simplified acoustic representation (not true spectrum) |
| **Lateral Inhibition** | Within-layer competition mechanism |
| **Luce Choice Rule** | Method for converting activations to response probabilities |
| **Phoneme Continuum** | Interpolated phonemes for categorical perception experiments |
| **Alignment** | Temporal position of a word/phoneme unit |
| **Time Slice** | Discrete temporal step in the model |
| **Monorepo** | Single repository containing multiple packages |

---

### Appendix B: Default Phoneme Inventory

| Symbol | Description | Example |
|--------|-------------|---------|
| `-` | Silence | (none) |
| `^` | Schwa (unstressed vowel) | ab**u**t |
| `p` | Voiceless bilabial stop | **p**at |
| `b` | Voiced bilabial stop | **b**at |
| `t` | Voiceless alveolar stop | **t**op |
| `d` | Voiced alveolar stop | **d**og |
| `k` | Voiceless velar stop | **c**at |
| `g` | Voiced velar stop | **g**oat |
| `s` | Voiceless alveolar fricative | **s**it |
| `S` | Voiceless postalveolar fricative | **sh**ip |
| `r` | Alveolar approximant | **r**at |
| `l` | Alveolar lateral approximant | **l**ap |
| `a` | Low back vowel | f**a**ther |
| `i` | High front vowel | b**ea**t |
| `u` | High back vowel | b**oo**t |

---

### Appendix C: Feature Continua

| Continuum | Abbreviation | Description |
|-----------|--------------|-------------|
| Power | POW | Overall acoustic energy |
| Vocalic | VOC | Vowel-like quality |
| Diffuse | DIF | Energy spread across frequency |
| Acute | ACU | High-frequency emphasis |
| Gradual | GRD | Gradual vs. abrupt onset |
| Voiced | VOI | Voicing (vocal fold vibration) |
| Burst | BUR | Burst energy (for stops) |

Each continuum has 9 levels (0-8), representing a gradient from absent (0) to maximally present (8).

---

### Appendix D: Key Parameters Explained

#### ALPHA (Between-Layer Gain)

| Parameter | Description | Default | Effect of Increase |
|-----------|-------------|---------|-------------------|
| `alpha.IF` | Input → Features | 0.04 | Stronger input influence |
| `alpha.FP` | Features → Phonemes | 0.02 | Stronger bottom-up activation |
| `alpha.PW` | Phonemes → Words | 0.05 | Stronger bottom-up activation |
| `alpha.WP` | Words → Phonemes | 0.03 | Stronger top-down feedback |
| `alpha.PF` | Phonemes → Features | 0.0 | (Disabled by default) |

---

#### GAMMA (Lateral Inhibition)

| Parameter | Description | Default | Effect of Increase |
|-----------|-------------|---------|-------------------|
| `gamma.F` | Feature competition | 0.04 | Stronger feature competition |
| `gamma.P` | Phoneme competition | 0.04 | Stronger phoneme competition |
| `gamma.W` | Word competition | 0.04 | Stronger word competition |

---

#### DECAY

| Parameter | Description | Default | Effect of Increase |
|-----------|-------------|---------|-------------------|
| `decay.F` | Feature decay rate | 0.01 | Faster return to rest |
| `decay.P` | Phoneme decay rate | 0.03 | Faster return to rest |
| `decay.W` | Word decay rate | 0.05 | Faster return to rest |

---

#### REST (Resting Levels)

| Parameter | Description | Default | Effect of Increase |
|-----------|-------------|---------|-------------------|
| `rest.F` | Feature resting level | -0.1 | Higher baseline activation |
| `rest.P` | Phoneme resting level | -0.05 | Higher baseline activation |
| `rest.W` | Word resting level | -0.05 | Higher baseline activation |

---

### Appendix E: File Structure Reference

```
tsTRACE/
├── packages/
│   ├── tracejs/                    # Backend package
│   │   ├── bin/
│   │   │   └── cli.js             # CLI entry point
│   │   ├── src/
│   │   │   ├── __tests__/         # Tests
│   │   │   ├── browser/           # Browser shims
│   │   │   ├── index.ts           # Public API
│   │   │   ├── trace-net.ts       # Neural network core
│   │   │   ├── trace-sim-base.ts  # Base simulation class
│   │   │   ├── trace-sim.ts       # Node.js simulation class
│   │   │   ├── trace-phones.ts    # Phoneme management
│   │   │   ├── trace-param.ts     # Configuration types
│   │   │   ├── trace-sim-analysis.ts  # Analysis tools
│   │   │   ├── jtrace-input.ts    # XML/JSON parsing
│   │   │   ├── jtrace-output.ts   # XML/JSON serialization
│   │   │   ├── stream.ts          # File I/O
│   │   │   ├── errors.ts          # Error types
│   │   │   └── util.ts            # Utilities
│   │   ├── dist/                  # Build output
│   │   │   ├── common/            # CommonJS build
│   │   │   └── esm/               # ES modules build
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   ├── tracejs-vue/               # Frontend package
│   │   ├── src/
│   │   │   ├── components/        # Vue components
│   │   │   │   ├── charts/        # Chart components
│   │   │   │   ├── NavigationTabs.vue
│   │   │   │   ├── SimulationToolbar.vue
│   │   │   │   ├── AnalysisConfig.vue
│   │   │   │   └── ConfigInput.vue
│   │   │   ├── views/             # Page-level components
│   │   │   │   ├── config/        # Config tab views
│   │   │   │   ├── data/          # Data tab views
│   │   │   │   ├── ConfigTab.vue
│   │   │   │   ├── SimulationTab.vue
│   │   │   │   ├── ChartTab.vue
│   │   │   │   └── DataTab.vue
│   │   │   ├── chart-controllers/ # Custom Chart.js controllers
│   │   │   │   ├── chartjs-chart-matrix.js
│   │   │   │   └── chartjs-box.js
│   │   │   ├── main.ts            # App entry point
│   │   │   ├── App.vue            # Root component
│   │   │   ├── store.ts           # State management
│   │   │   └── constants.ts       # Constants
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── dist/                  # Build output
│   │   ├── index.html             # HTML entry point
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── playground/                # Development sandbox
│       ├── index.js
│       └── package.json
├── package.json                   # Root package.json (workspaces)
├── README.md                      # Project README
├── jstrace-user-interface-guide.ipynb  # User guide
└── LICENSE

```

---

### Appendix F: References

**Original TRACE Paper**:
- McClelland, J.L., & Elman, J. L. (1986). The TRACE model of speech perception. *Cognitive Psychology*, 18, 1-86.

**jTRACE Implementation**:
- Strauss, T. J., Harris, H. D., & Magnuson, J. S. (2007). jTRACE: A reimplementation and extension of the TRACE model of speech perception and spoken word recognition. *Behavior Research Methods*, 39(1), 19-30.

**Key TRACE Studies**:
- Dahan, D., Magnuson, J.S., & Tanenhaus, M.K. (2001). Time course of frequency effects in spoken-word recognition: evidence from eye movements. *Cognitive Psychology*, 42, 317–367.
- Magnuson, J.S., Strauss, T.J., Harris, H.D. (2005). Feedback in models of spoken word recognition: Feedback Helps. *Proceedings of CogSci 2005*.
- McClelland, J.L. (1991). Stochastic interactive processes and the effect of context on perception. *Cognitive Psychology*, 23, 1-44.

**Computational Modeling**:
- Magnuson, J.S., Harris, H.D., & Mirman, D. (2012). Computational models of spoken word recognition. In M. Spivey, M. Joanisse, & K. McRae (Eds.), *The Cambridge Handbook of Psycholinguistics* (pp. 76-103). Cambridge University Press.

---

### Appendix G: Contact and Support

**General Information**:
- Contact: James Magnuson (james.magnuson@uconn.edu)

**Bug Reports and Issues**:
- GitHub: https://github.com/andrew0/tracejs/issues

**Development**:
- Lead Developer: Andrew Curtice
- Principal Investigator: James Magnuson

**Funding**:
- NSF Grant 1754284 (Magnuson & Rueckl)
- NIDCD Grant DC-005765 (Magnuson)

---

## Document Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2023-10-18 | Initial system design document | System Design Team |

---

**End of System Design Document**
