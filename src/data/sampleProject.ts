import { Project, Board, ElementStyle, CanvasElement } from '../types/canvas';

const defaultStyle: ElementStyle = {
  strokeColor: '#38bdf8',
  fillColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  opacity: 1,
  fontSize: 16,
  fontFamily: 'Inter',
  cornerRadius: 8,
};

// Generates an inline SVG data URI representing a crisp scientific research chart
function createSampleChartSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" fill="#181a20">
    <rect width="600" height="380" rx="12" fill="#181a20" stroke="#2e323b" stroke-width="2"/>
    <text x="30" y="42" fill="#f8fafc" font-family="Inter, sans-serif" font-size="18" font-weight="bold">Thermal Dissipation vs. Neural Flux Density</text>
    <text x="30" y="65" fill="#94a3b8" font-family="Inter, sans-serif" font-size="12">Sample Group N=1,420 • Continuous Observation Window</text>
    <line x1="60" y1="310" x2="550" y2="310" stroke="#334155" stroke-width="1.5"/>
    <line x1="60" y1="90" x2="60" y2="310" stroke="#334155" stroke-width="1.5"/>
    <!-- Gridlines -->
    <line x1="60" y1="240" x2="550" y2="240" stroke="#1e293b" stroke-dasharray="4,4"/>
    <line x1="60" y1="170" x2="550" y2="170" stroke="#1e293b" stroke-dasharray="4,4"/>
    <line x1="60" y1="100" x2="550" y2="100" stroke="#1e293b" stroke-dasharray="4,4"/>
    <!-- Curves -->
    <path d="M 60 280 Q 200 270 320 180 T 540 110" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
    <path d="M 60 295 Q 180 290 310 230 T 540 190" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="6,4"/>
    <!-- Points -->
    <circle cx="320" cy="180" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
    <circle cx="540" cy="110" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
    <circle cx="310" cy="230" r="6" fill="#a855f7" stroke="#ffffff" stroke-width="2"/>
    <!-- Legend -->
    <rect x="360" y="25" width="12" height="12" rx="3" fill="#38bdf8"/>
    <text x="380" y="35" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="12">Hypothesis A (Adaptive)</text>
    <rect x="360" y="45" width="12" height="12" rx="3" fill="#a855f7"/>
    <text x="380" y="55" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="12">Control Model (Baseline)</text>
    <!-- Axis Labels -->
    <text x="260" y="340" fill="#64748b" font-family="Inter, sans-serif" font-size="11">Time Horizon (Epochs)</text>
    <text x="15" y="200" fill="#64748b" font-family="Inter, sans-serif" font-size="11" transform="rotate(-90 15 200)">Flux Index (mW/mm²)</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------
// BOARD 1: Overview & Hypotheses
// ----------------------------------------------------
const board1Elements: CanvasElement[] = [
  // Title Banner
  {
    id: 'b1_title_banner',
    type: 'rectangle',
    x: 80,
    y: 60,
    width: 980,
    height: 100,
    rotation: 0,
    zIndex: 1,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(56, 189, 248, 0.1)',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      cornerRadius: 16,
    },
  },
  {
    id: 'b1_title_text',
    type: 'text',
    x: 110,
    y: 80,
    width: 920,
    height: 36,
    rotation: 0,
    zIndex: 2,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 26,
      fontFamily: 'Inter',
    },
    text: '🔬 Scientific Research & Investigation: Quantum Bio-Signaling',
  },
  {
    id: 'b1_subtitle_text',
    type: 'text',
    x: 112,
    y: 122,
    width: 900,
    height: 24,
    rotation: 0,
    zIndex: 3,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#94a3b8',
      fontSize: 14,
    },
    text: 'A visual research module investigating coherent energy transport in cellular micro-tubules • Lead Investigator: Dr. A. Vance',
  },

  // Research Questions Sticky Note
  {
    id: 'b1_sticky_q',
    type: 'sticky',
    x: 80,
    y: 200,
    width: 280,
    height: 240,
    rotation: 0,
    zIndex: 4,
    style: {
      ...defaultStyle,
      fillColor: '#fef08a', // Yellow
      strokeColor: '#eab308',
      strokeWidth: 1,
      fontSize: 15,
    },
    text: '📌 Primary Research Questions:\n\n1. Does macroscopic entanglement persist at physiological temperature (310 K)?\n\n2. What is the damping coefficient of thermal dissipation?\n\n3. Can decoherence be mitigated through shielded peptide resonances?',
    color: '#fef08a',
  },

  // Concept Box 1: Variable Input
  {
    id: 'b1_concept_1',
    type: 'rectangle',
    x: 420,
    y: 220,
    width: 220,
    height: 120,
    rotation: 0,
    zIndex: 5,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(34, 197, 94, 0.12)',
      strokeColor: '#22c55e',
      strokeWidth: 2,
      cornerRadius: 12,
    },
  },
  {
    id: 'b1_concept_1_t',
    type: 'text',
    x: 440,
    y: 255,
    width: 180,
    height: 48,
    rotation: 0,
    zIndex: 6,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 16,
    },
    text: 'Input Variable α:\nPulse Frequency (840 nm)',
  },

  // Concept Box 2: Working Hypothesis
  {
    id: 'b1_concept_2',
    type: 'diamond',
    x: 740,
    y: 205,
    width: 190,
    height: 150,
    rotation: 0,
    zIndex: 7,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(168, 85, 247, 0.15)',
      strokeColor: '#a855f7',
      strokeWidth: 2,
    },
  },
  {
    id: 'b1_concept_2_t',
    type: 'text',
    x: 770,
    y: 260,
    width: 130,
    height: 40,
    rotation: 0,
    zIndex: 8,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 15,
    },
    text: 'Phase Coherence Sustained?',
  },

  // Smart Connector from Concept 1 to Concept 2
  {
    id: 'b1_connector_1_2',
    type: 'connector',
    fromElementId: 'b1_concept_1',
    toElementId: 'b1_concept_2',
    fromAnchor: 'right',
    toAnchor: 'left',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    zIndex: 9,
    style: {
      ...defaultStyle,
      strokeColor: '#38bdf8',
      strokeWidth: 2.5,
    },
    label: 'Coupling',
  },

  // Outcome Box: Resonance
  {
    id: 'b1_concept_3',
    type: 'rectangle',
    x: 1040,
    y: 220,
    width: 220,
    height: 120,
    rotation: 0,
    zIndex: 10,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(56, 189, 248, 0.15)',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      cornerRadius: 12,
    },
  },
  {
    id: 'b1_concept_3_t',
    type: 'text',
    x: 1060,
    y: 255,
    width: 180,
    height: 48,
    rotation: 0,
    zIndex: 11,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 16,
    },
    text: 'Measured Resonance:\nΔE = 4.2 meV Peak',
  },

  // Smart Connector from Concept 2 to Concept 3
  {
    id: 'b1_connector_2_3',
    type: 'connector',
    fromElementId: 'b1_concept_2',
    toElementId: 'b1_concept_3',
    fromAnchor: 'right',
    toAnchor: 'left',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    zIndex: 12,
    style: {
      ...defaultStyle,
      strokeColor: '#a855f7',
      strokeWidth: 2.5,
    },
    label: 'Yes (p < 0.01)',
  },

  // Literature sticky note
  {
    id: 'b1_sticky_lit',
    type: 'sticky',
    x: 420,
    y: 400,
    width: 320,
    height: 180,
    rotation: 0,
    zIndex: 13,
    style: {
      ...defaultStyle,
      fillColor: '#bae6fd', // Sky blue
      strokeColor: '#38bdf8',
      strokeWidth: 1,
      fontSize: 14,
    },
    text: '📚 Key Literature References:\n\n• Fröhlich, H. (1968): Long-range coherence in biological systems.\n• Tegmark, M. (2000): Thermal decoherence limits.\n• Hagan et al. (2002): Quantum computation in microtubules re-evaluated.',
    color: '#bae6fd',
  },

  // Callout bubble note
  {
    id: 'b1_callout',
    type: 'callout',
    x: 820,
    y: 420,
    width: 280,
    height: 110,
    rotation: 0,
    zIndex: 14,
    pointerOffsetX: -40,
    pointerOffsetY: -60,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(234, 179, 8, 0.15)',
      strokeColor: '#eab308',
      strokeWidth: 2,
    },
    text: '⚠️ Critical Note: Calibration check needed every 45 mins to prevent photobleaching drift.',
  },
];

// ----------------------------------------------------
// BOARD 2: Methodology & Experimental Flowchart
// ----------------------------------------------------
const board2Elements: CanvasElement[] = [
  // Title Banner
  {
    id: 'b2_title_banner',
    type: 'rectangle',
    x: 80,
    y: 50,
    width: 980,
    height: 90,
    rotation: 0,
    zIndex: 1,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(168, 85, 247, 0.1)',
      strokeColor: '#a855f7',
      strokeWidth: 2,
      cornerRadius: 16,
    },
  },
  {
    id: 'b2_title_text',
    type: 'text',
    x: 110,
    y: 72,
    width: 900,
    height: 32,
    rotation: 0,
    zIndex: 2,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 24,
      fontFamily: 'Inter',
    },
    text: '⚡ Methodology: 4-Stage Experimental Protocol & Decision Matrix',
  },
  {
    id: 'b2_sub_text',
    type: 'text',
    x: 112,
    y: 108,
    width: 800,
    height: 20,
    rotation: 0,
    zIndex: 3,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#94a3b8',
      fontSize: 13,
    },
    text: 'Automated spectroscopic extraction pipeline with real-time feedback loops',
  },

  // Flowchart Step 1
  {
    id: 'b2_step_1',
    type: 'rectangle',
    x: 80,
    y: 200,
    width: 220,
    height: 100,
    rotation: 0,
    zIndex: 4,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(56, 189, 248, 0.15)',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      cornerRadius: 10,
    },
  },
  {
    id: 'b2_step_1_t',
    type: 'text',
    x: 100,
    y: 225,
    width: 180,
    height: 48,
    rotation: 0,
    zIndex: 5,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 15,
    },
    text: 'Stage 1: Sample Prep\n(Cryo-vitrification @ 77K)',
  },

  // Flowchart Step 2
  {
    id: 'b2_step_2',
    type: 'rectangle',
    x: 380,
    y: 200,
    width: 220,
    height: 100,
    rotation: 0,
    zIndex: 6,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(34, 197, 94, 0.15)',
      strokeColor: '#22c55e',
      strokeWidth: 2,
      cornerRadius: 10,
    },
  },
  {
    id: 'b2_step_2_t',
    type: 'text',
    x: 400,
    y: 225,
    width: 180,
    height: 48,
    rotation: 0,
    zIndex: 7,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 15,
    },
    text: 'Stage 2: Laser Excitation\n(fs-Pulse Interferometry)',
  },

  // Connector 1 -> 2
  {
    id: 'b2_conn_1_2',
    type: 'connector',
    fromElementId: 'b2_step_1',
    toElementId: 'b2_step_2',
    fromAnchor: 'right',
    toAnchor: 'left',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    zIndex: 8,
    style: { ...defaultStyle, strokeColor: '#38bdf8', strokeWidth: 2 },
  },

  // Decision Diamond
  {
    id: 'b2_decision',
    type: 'diamond',
    x: 690,
    y: 175,
    width: 180,
    height: 150,
    rotation: 0,
    zIndex: 9,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(234, 179, 8, 0.15)',
      strokeColor: '#eab308',
      strokeWidth: 2,
    },
  },
  {
    id: 'b2_decision_t',
    type: 'text',
    x: 720,
    y: 232,
    width: 120,
    height: 36,
    rotation: 0,
    zIndex: 10,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 14,
    },
    text: 'SNR > 24 dB?',
  },

  // Connector 2 -> Decision
  {
    id: 'b2_conn_2_dec',
    type: 'connector',
    fromElementId: 'b2_step_2',
    toElementId: 'b2_decision',
    fromAnchor: 'right',
    toAnchor: 'left',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    zIndex: 11,
    style: { ...defaultStyle, strokeColor: '#22c55e', strokeWidth: 2 },
  },

  // Success Step 3
  {
    id: 'b2_step_3',
    type: 'rectangle',
    x: 960,
    y: 200,
    width: 220,
    height: 100,
    rotation: 0,
    zIndex: 12,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(56, 189, 248, 0.2)',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      cornerRadius: 10,
    },
  },
  {
    id: 'b2_step_3_t',
    type: 'text',
    x: 980,
    y: 225,
    width: 180,
    height: 48,
    rotation: 0,
    zIndex: 13,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 15,
    },
    text: 'Stage 3: Spectral Binning\n(Fourier Transform FFT)',
  },

  // Connector Decision -> Step 3
  {
    id: 'b2_conn_dec_3',
    type: 'connector',
    fromElementId: 'b2_decision',
    toElementId: 'b2_step_3',
    fromAnchor: 'right',
    toAnchor: 'left',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    zIndex: 14,
    style: { ...defaultStyle, strokeColor: '#22c55e', strokeWidth: 2 },
    label: 'Valid',
  },

  // Research Table: Parameters Matrix
  {
    id: 'b2_table',
    type: 'table',
    x: 80,
    y: 380,
    width: 820,
    height: 210,
    rotation: 0,
    zIndex: 15,
    rows: 4,
    cols: 4,
    colWidths: [200, 200, 200, 220],
    rowHeight: 45,
    headers: ['Parameter', 'Control Group (N=50)', 'Target Assay A', 'Target Assay B'],
    data: [
      ['Laser Wavefront', 'Continuous CW (532nm)', 'Pulsed (840nm, 100fs)', 'Pulsed (840nm, 25fs)'],
      ['Ambient Temp', '295.0 ± 0.5 K', '310.2 ± 0.1 K', '310.2 ± 0.1 K'],
      ['Decoherence Time', '< 0.45 ps', '2.84 ± 0.12 ps', '4.19 ± 0.08 ps'],
      ['Confidence Interval', 'p = 0.42 (N.S.)', 'p < 0.005 (Sig.)', 'p < 0.001 (Very Sig.)'],
    ],
    style: {
      ...defaultStyle,
      strokeColor: '#38bdf8',
      strokeWidth: 1.5,
      fillColor: '#1e2025',
    },
  },

  // Sticky Note with Protocol Checks
  {
    id: 'b2_sticky_protocol',
    type: 'sticky',
    x: 940,
    y: 380,
    width: 250,
    height: 210,
    rotation: 0,
    zIndex: 16,
    style: {
      ...defaultStyle,
      fillColor: '#bbf7d0', // Green pastel
      strokeColor: '#22c55e',
      strokeWidth: 1,
      fontSize: 14,
    },
    text: '✅ Quality Assurance Checklist:\n\n• Argon gas purges active\n• Dark current corrected\n• Stray light filter < 0.01%\n• Independent blind verification logged',
    color: '#bbf7d0',
  },
];

// ----------------------------------------------------
// BOARD 3: Observations, Data & Annotations
// ----------------------------------------------------
const sampleChartImageUri = createSampleChartSvg();

const board3Elements: CanvasElement[] = [
  // Title
  {
    id: 'b3_title_banner',
    type: 'rectangle',
    x: 80,
    y: 50,
    width: 980,
    height: 90,
    rotation: 0,
    zIndex: 1,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(34, 197, 94, 0.1)',
      strokeColor: '#22c55e',
      strokeWidth: 2,
      cornerRadius: 16,
    },
  },
  {
    id: 'b3_title_text',
    type: 'text',
    x: 110,
    y: 72,
    width: 900,
    height: 32,
    rotation: 0,
    zIndex: 2,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#ffffff',
      fontSize: 24,
      fontFamily: 'Inter',
    },
    text: '📊 Observations, Image Evidence & Quantitative Annotations',
  },
  {
    id: 'b3_sub_text',
    type: 'text',
    x: 112,
    y: 108,
    width: 800,
    height: 20,
    rotation: 0,
    zIndex: 3,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#94a3b8',
      fontSize: 13,
    },
    text: 'Inspect annotated spectrometer figures, peak harmonics, and synthesis conclusions',
  },

  // Research Chart Image Card with Interactive Annotation Pins
  {
    id: 'b3_image_chart',
    type: 'image',
    x: 80,
    y: 180,
    width: 600,
    height: 380,
    rotation: 0,
    zIndex: 4,
    src: sampleChartImageUri,
    naturalWidth: 600,
    naturalHeight: 380,
    caption: 'Figure 4.2: Real-time kinetic curve demonstrating resonance plateau.',
    annotations: [
      {
        id: 'pin_1',
        x: 320,
        y: 180,
        title: 'Inflection Point (Epoch 300)',
        description: 'Abrupt emergence of synchronized resonance peak above 10 dB baseline.',
      },
      {
        id: 'pin_2',
        x: 540,
        y: 110,
        title: 'Terminal Coherence State',
        description: 'Steady-state preservation without observable thermal collapse.',
      },
    ],
    style: {
      ...defaultStyle,
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      cornerRadius: 12,
    },
  },

  // Findings Sticky Note
  {
    id: 'b3_sticky_findings',
    type: 'sticky',
    x: 720,
    y: 180,
    width: 320,
    height: 200,
    rotation: 0,
    zIndex: 5,
    style: {
      ...defaultStyle,
      fillColor: '#fbcfe8', // Pink pastel
      strokeColor: '#ec4899',
      strokeWidth: 1,
      fontSize: 14,
    },
    text: '💡 Key Empirical Findings:\n\n1. Coherence lifetime extended by ~9.3x compared to classical predictions.\n\n2. Resonance mode matches vibrational eigenvalue of tryptophan ladder.\n\n3. Consistent across 14 independent trial runs.',
    color: '#fbcfe8',
  },

  // Executive Conclusions Box
  {
    id: 'b3_conclusion_card',
    type: 'rectangle',
    x: 720,
    y: 400,
    width: 480,
    height: 160,
    rotation: 0,
    zIndex: 6,
    style: {
      ...defaultStyle,
      fillColor: 'rgba(56, 189, 248, 0.12)',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      cornerRadius: 14,
    },
  },
  {
    id: 'b3_conc_title',
    type: 'text',
    x: 745,
    y: 420,
    width: 430,
    height: 28,
    rotation: 0,
    zIndex: 7,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#38bdf8',
      fontSize: 18,
      fontFamily: 'Inter',
    },
    text: '🎯 Investigation Conclusions & Next Actions',
  },
  {
    id: 'b3_conc_body',
    type: 'text',
    x: 745,
    y: 455,
    width: 430,
    height: 80,
    rotation: 0,
    zIndex: 8,
    style: {
      ...defaultStyle,
      strokeColor: 'transparent',
      fillColor: '#cbd5e1',
      fontSize: 14,
      fontFamily: 'Inter',
    },
    text: 'The experimental evidence supports shielded sub-cellular quantum phenomena at physiological temperatures. Recommended follow-up: in-vivo animal model assay and publication pre-print draft.',
  },
];

export const sampleBoards: Board[] = [
  {
    id: 'board_overview',
    title: '1. Hypotheses & Overview',
    description: 'Core questions, conceptual model, and theoretical background',
    elements: board1Elements,
    camera: { x: 40, y: 30, zoom: 0.95 },
    gridType: 'dots',
    history: { past: [], future: [] },
  },
  {
    id: 'board_methodology',
    title: '2. Methodology Flowchart',
    description: 'Protocol flowchart, parameters matrix, and decision gates',
    elements: board2Elements,
    camera: { x: 40, y: 30, zoom: 0.95 },
    gridType: 'dots',
    history: { past: [], future: [] },
  },
  {
    id: 'board_data',
    title: '3. Data & Observations',
    description: 'Spectrometric curves, annotated figures, and findings',
    elements: board3Elements,
    camera: { x: 40, y: 30, zoom: 0.95 },
    gridType: 'dots',
    history: { past: [], future: [] },
  },
];

export const sampleProject: Project = {
  id: 'proj_scientific_research',
  title: 'Scientific Research and Investigation',
  description: 'Quantum Bio-Signaling investigation board with multi-page study modules',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  theme: 'dark',
  boards: sampleBoards,
  activeBoardId: 'board_overview',
};
