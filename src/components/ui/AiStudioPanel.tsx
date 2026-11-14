import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Workflow,
  Network,
  BookOpen,
  Key,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  AlertCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { CanvasElement, ElementStyle } from '../../types/canvas';
import { generateId } from '../../utils/id';
import {
  getStoredAiConfig,
  saveStoredAiConfig,
  generateDiagramFromAi,
  convertAiResultToCanvasElements,
  AiConfig,
  AiProvider,
} from '../../services/aiService';

type AiMode = 'mindmap' | 'flowchart' | 'hypothesis' | 'studymodule' | 'summarize' | 'explain';

interface GeneratedPreview {
  title: string;
  summary: string;
  elements: CanvasElement[];
}

export const AiStudioPanel: React.FC = () => {
  const {
    isAiStudioOpen,
    setAiStudioOpen,
    getCamera,
    addElementsBatch,
    getActiveBoard,
  } = useCanvasStore();

  const [mode, setMode] = useState<AiMode>('mindmap');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedPreview | null>(null);

  // AI Configuration State
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const config = getStoredAiConfig();
    setProvider(config.provider);
    setApiKey(config.apiKey);
    setBaseUrl(config.baseUrl || '');
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    saveStoredAiConfig({ apiKey: val });
  };

  const handleProviderChange = (p: AiProvider) => {
    setProvider(p);
    saveStoredAiConfig({ provider: p });
  };

  const handleBaseUrlChange = (url: string) => {
    setBaseUrl(url);
    saveStoredAiConfig({ baseUrl: url });
  };

  if (!isAiStudioOpen) return null;

  const defaultStyle: ElementStyle = {
    strokeColor: '#38bdf8',
    fillColor: 'transparent',
    strokeWidth: 2,
    strokeStyle: 'solid',
    opacity: 1,
    fontSize: 15,
    fontFamily: 'Inter',
    cornerRadius: 10,
  };

  const handleQuickTemplate = (text: string) => {
    setPrompt(text);
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setPreview(null);

    const camera = getCamera();
    const centerX = Math.round((window.innerWidth / 2 - camera.x) / camera.zoom);
    const centerY = Math.round((window.innerHeight / 2 - camera.y) / camera.zoom);

    // If an API key is provided, use the real LLM endpoint
    if (apiKey.trim()) {
      abortControllerRef.current = new AbortController();
      try {
        const config: AiConfig = {
          provider,
          apiKey: apiKey.trim(),
          baseUrl: baseUrl.trim() || undefined,
        };

        const result = await generateDiagramFromAi(prompt, config, abortControllerRef.current.signal);
        const elements = convertAiResultToCanvasElements(result, centerX, centerY, mode);

        setPreview({
          title: result.title || `AI Generated: ${prompt.slice(0, 30)}`,
          summary: result.summary || `Synthesized ${result.nodes.length} nodes via ${provider.toUpperCase()}`,
          elements,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User aborted
          return;
        }
        setErrorMessage(err.message || 'AI request failed. Please check your API key and connection.');
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
      return;
    }

    // Offline Template Engine (No API key configured)
    setTimeout(() => {
      let generated: GeneratedPreview;

      if (mode === 'mindmap') {
        const rootId = generateId('ai_root');
        const node1Id = generateId('ai_n1');
        const node2Id = generateId('ai_n2');
        const node3Id = generateId('ai_n3');

        const elements: CanvasElement[] = [
          // Central topic node
          {
            id: rootId,
            type: 'rectangle',
            x: centerX - 120,
            y: centerY - 40,
            width: 240,
            height: 80,
            rotation: 0,
            zIndex: 1,
            style: { ...defaultStyle, fillColor: 'rgba(56, 189, 248, 0.2)', strokeColor: '#38bdf8', strokeWidth: 2.5 },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 100,
            y: centerY - 12,
            width: 200,
            height: 24,
            rotation: 0,
            zIndex: 2,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 16 },
            text: prompt.slice(0, 30),
          },

          // Branch 1: Theory
          {
            id: node1Id,
            type: 'rectangle',
            x: centerX - 360,
            y: centerY - 160,
            width: 180,
            height: 70,
            rotation: 0,
            zIndex: 3,
            style: { ...defaultStyle, fillColor: 'rgba(168, 85, 247, 0.15)', strokeColor: '#a855f7' },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 345,
            y: centerY - 140,
            width: 150,
            height: 30,
            rotation: 0,
            zIndex: 4,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 14 },
            text: '1. Theoretical Basis',
          },
          {
            id: generateId('conn'),
            type: 'connector',
            fromElementId: rootId,
            toElementId: node1Id,
            fromAnchor: 'left',
            toAnchor: 'right',
            x: 0, y: 0, width: 0, height: 0, rotation: 0, zIndex: 5,
            style: { ...defaultStyle, strokeColor: '#a855f7' },
          },

          // Branch 2: Evidence
          {
            id: node2Id,
            type: 'rectangle',
            x: centerX + 180,
            y: centerY - 160,
            width: 180,
            height: 70,
            rotation: 0,
            zIndex: 6,
            style: { ...defaultStyle, fillColor: 'rgba(34, 197, 94, 0.15)', strokeColor: '#22c55e' },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX + 195,
            y: centerY - 140,
            width: 150,
            height: 30,
            rotation: 0,
            zIndex: 7,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 14 },
            text: '2. Empirical Proof',
          },
          {
            id: generateId('conn'),
            type: 'connector',
            fromElementId: rootId,
            toElementId: node2Id,
            fromAnchor: 'right',
            toAnchor: 'left',
            x: 0, y: 0, width: 0, height: 0, rotation: 0, zIndex: 8,
            style: { ...defaultStyle, strokeColor: '#22c55e' },
          },

          // Branch 3: Implications
          {
            id: node3Id,
            type: 'rectangle',
            x: centerX - 90,
            y: centerY + 140,
            width: 200,
            height: 70,
            rotation: 0,
            zIndex: 9,
            style: { ...defaultStyle, fillColor: 'rgba(234, 179, 8, 0.15)', strokeColor: '#eab308' },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 75,
            y: centerY + 160,
            width: 170,
            height: 30,
            rotation: 0,
            zIndex: 10,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 14 },
            text: '3. Clinical Translation',
          },
          {
            id: generateId('conn'),
            type: 'connector',
            fromElementId: rootId,
            toElementId: node3Id,
            fromAnchor: 'bottom',
            toAnchor: 'top',
            x: 0, y: 0, width: 0, height: 0, rotation: 0, zIndex: 11,
            style: { ...defaultStyle, strokeColor: '#eab308' },
          },
        ];

        generated = {
          title: `Mind Map: ${prompt.slice(0, 25)}`,
          summary: 'Synthesized 1 core concept, 3 thematic clusters, and 3 bidirectional connectors.',
          elements,
        };
      } else if (mode === 'flowchart') {
        const s1Id = generateId('s1');
        const s2Id = generateId('s2');
        const s3Id = generateId('s3');

        const elements: CanvasElement[] = [
          // Step 1
          {
            id: s1Id,
            type: 'rectangle',
            x: centerX - 320,
            y: centerY - 40,
            width: 180,
            height: 80,
            rotation: 0,
            zIndex: 1,
            style: { ...defaultStyle, fillColor: 'rgba(56, 189, 248, 0.15)', strokeColor: '#38bdf8' },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 305,
            y: centerY - 15,
            width: 150,
            height: 30,
            rotation: 0,
            zIndex: 2,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 14 },
            text: 'Input / Ingestion',
          },

          // Step 2 Decision
          {
            id: s2Id,
            type: 'diamond',
            x: centerX - 60,
            y: centerY - 50,
            width: 120,
            height: 100,
            rotation: 0,
            zIndex: 3,
            style: { ...defaultStyle, fillColor: 'rgba(234, 179, 8, 0.15)', strokeColor: '#eab308' },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 45,
            y: centerY - 15,
            width: 90,
            height: 30,
            rotation: 0,
            zIndex: 4,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 13 },
            text: 'Valid?',
          },

          // Step 3 Outcome
          {
            id: s3Id,
            type: 'rectangle',
            x: centerX + 140,
            y: centerY - 40,
            width: 180,
            height: 80,
            rotation: 0,
            zIndex: 5,
            style: { ...defaultStyle, fillColor: 'rgba(34, 197, 94, 0.15)', strokeColor: '#22c55e' },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX + 155,
            y: centerY - 15,
            width: 150,
            height: 30,
            rotation: 0,
            zIndex: 6,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#ffffff', fontSize: 14 },
            text: 'Publish Result',
          },

          // Connectors
          {
            id: generateId('conn'),
            type: 'connector',
            fromElementId: s1Id,
            toElementId: s2Id,
            fromAnchor: 'right',
            toAnchor: 'left',
            x: 0, y: 0, width: 0, height: 0, rotation: 0, zIndex: 7,
            style: { ...defaultStyle, strokeColor: '#38bdf8' },
          },
          {
            id: generateId('conn'),
            type: 'connector',
            fromElementId: s2Id,
            toElementId: s3Id,
            fromAnchor: 'right',
            toAnchor: 'left',
            x: 0, y: 0, width: 0, height: 0, rotation: 0, zIndex: 8,
            style: { ...defaultStyle, strokeColor: '#22c55e' },
          },
        ];

        generated = {
          title: `Flowchart: ${prompt.slice(0, 25)}`,
          summary: 'Created a 3-step decision pipeline with validation logic.',
          elements,
        };
      } else {
        // Study Module card
        const cardId = generateId('study');
        const elements: CanvasElement[] = [
          {
            id: cardId,
            type: 'rectangle',
            x: centerX - 180,
            y: centerY - 120,
            width: 360,
            height: 240,
            rotation: 0,
            zIndex: 1,
            style: { ...defaultStyle, fillColor: 'rgba(15, 23, 42, 0.85)', strokeColor: '#818cf8', strokeWidth: 2 },
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 160,
            y: centerY - 100,
            width: 320,
            height: 30,
            rotation: 0,
            zIndex: 2,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#818cf8', fontSize: 16 },
            text: `Study Module: ${prompt.slice(0, 30)}`,
          },
          {
            id: generateId('txt'),
            type: 'text',
            x: centerX - 160,
            y: centerY - 60,
            width: 320,
            height: 160,
            rotation: 0,
            zIndex: 3,
            style: { ...defaultStyle, strokeColor: 'transparent', fillColor: '#e2e8f0', fontSize: 13 },
            text: `Key Findings & Questions:\n\n1. Primary objective and methodology\n2. Control groups & experimental isolation\n3. Observed significance thresholds (p < 0.01)\n4. Open verification vectors for peer review`,
          },
        ];

        generated = {
          title: `Study Card: ${prompt.slice(0, 25)}`,
          summary: 'Assembled study module card with study points and review criteria.',
          elements,
        };
      }

      setPreview(generated);
      setIsGenerating(false);
    }, 500);
  };

  const handleConfirmInsert = () => {
    if (!preview) return;
    addElementsBatch(preview.elements);
    setPreview(null);
    setAiStudioOpen(false);
  };

  return (
    <div className="fixed right-0 top-16 bottom-14 w-96 bg-[#181a20]/95 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col shadow-floating animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
              AI Studio
              {apiKey.trim() ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {provider === 'gemini' ? 'Gemini 2.5' : 'OpenAI'}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Offline templates (no AI model)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Generate diagrams, syntheses, & study nodes</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Configure AI Model & API Key"
            className={`p-1.5 rounded-lg transition-colors ${
              showSettings || apiKey.trim()
                ? 'text-sky-400 bg-sky-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAiStudioOpen(false)}
            aria-label="Close AI Studio"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model & API Key Configuration Drawer */}
      {showSettings && (
        <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 text-xs space-y-3 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Model Provider</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`py-1.5 px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  provider === 'gemini'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`py-1.5 px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  provider === 'openai'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                OpenAI-compatible
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>API Key</span>
              {apiKey.trim() && (
                <span className="text-[10px] text-emerald-400 font-mono">Configured</span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              className="w-full bg-[#121316] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-sky-500 text-xs font-mono"
            />
          </div>

          {provider === 'openai' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Base URL (optional)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-[#121316] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-sky-500 text-xs font-mono"
              />
            </div>
          )}

          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-slate-400 space-y-1">
            <p className="text-amber-300/90 font-medium">
              Notice: API key is stored locally in this browser only.
            </p>
            <p>
              It is never saved to project files or exported. If no key is set, the offline synthesis templates will be used.
            </p>
          </div>
        </div>
      )}

      {/* Modes Bar */}
      <div className="grid grid-cols-3 gap-1 p-3 border-b border-white/10 bg-white/[0.02]">
        <button
          onClick={() => setMode('mindmap')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
            mode === 'mindmap'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-4 h-4" />
          <span className="text-[10px] font-medium">Mind Map</span>
        </button>
        <button
          onClick={() => setMode('flowchart')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
            mode === 'flowchart'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span className="text-[10px] font-medium">Flowchart</span>
        </button>
        <button
          onClick={() => setMode('studymodule')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
            mode === 'studymodule'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-medium">Study Card</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Error Display Banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Generation Error</span>
              <p className="text-[11px] text-red-200/90 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick prompt templates */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Research Prompts
          </span>
          <div className="space-y-1.5">
            {[
              'Quantum Coherence Transport in Cellular Microtubules',
              'Four-Stage Spectroscopic Protocol & Decision Gates',
              'Decoherence Mitigation via Peptide Shielding',
            ].map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => handleQuickTemplate(tmpl)}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[11px] text-slate-300 hover:text-white transition-colors truncate flex items-center justify-between"
              >
                <span className="truncate">{tmpl}</span>
                <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Area */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
            Describe what diagram or notes to generate:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Generate a concept map connecting quantum entanglement with biological energy transfer..."
            className="w-full bg-[#121316] border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-500 resize-none font-sans"
          />
        </div>

        {/* Generate / Cancel Button */}
        {isGenerating ? (
          <div className="flex gap-2">
            <button
              disabled
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500/50 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-wait"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Canvas Elements...</span>
            </button>
            <button
              onClick={handleCancelGeneration}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {apiKey.trim() ? 'Generate with AI' : 'Generate Vector Diagram (Template)'}
            </span>
          </button>
        )}

        {/* Preview & Confirmation Step (Never silently overwrite!) */}
        {preview && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-sky-500/30 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Generation Ready for Review
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {preview.elements.length} elements
              </span>
            </div>

            <div>
              <h4 className="text-xs font-medium text-white">{preview.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{preview.summary}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>Target: Active Board ({getActiveBoard().title})</span>
              </div>
              <div>• Individual vector shapes ready to be positioned, resized & restyled.</div>
              <div>• Existing canvas elements will NOT be overwritten.</div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmInsert}
                className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Insert to Canvas</span>
              </button>
              <button
                onClick={() => setPreview(null)}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
