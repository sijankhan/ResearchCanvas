import { z } from 'zod';
import { CanvasElement, ElementStyle } from '../types/canvas';
import { generateId } from '../utils/id';

export const AiGeneratedNodeSchema = z.object({
  type: z.enum(['rectangle', 'diamond', 'circle', 'callout']).default('rectangle'),
  text: z.string(),
  width: z.number().optional().default(180),
  height: z.number().optional().default(70),
});

export const AiGeneratedEdgeSchema = z.object({
  fromIndex: z.number().int().nonnegative(),
  toIndex: z.number().int().nonnegative(),
  label: z.string().optional(),
});

export const AiGenerationResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  nodes: z.array(AiGeneratedNodeSchema).min(1),
  edges: z.array(AiGeneratedEdgeSchema).optional().default([]),
});

export type AiGenerationResult = z.infer<typeof AiGenerationResultSchema>;

export type AiProvider = 'gemini' | 'openai';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export const API_KEY_STORAGE_KEY = 'research_canvas_api_key';
export const AI_PROVIDER_STORAGE_KEY = 'research_canvas_ai_provider';
export const AI_BASE_URL_STORAGE_KEY = 'research_canvas_ai_base_url';

export function getStoredAiConfig(): AiConfig {
  const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  const provider = (localStorage.getItem(AI_PROVIDER_STORAGE_KEY) as AiProvider) || 'gemini';
  const baseUrl = localStorage.getItem(AI_BASE_URL_STORAGE_KEY) || (provider === 'gemini' ? '' : 'https://api.openai.com/v1');
  return { provider, apiKey, baseUrl };
}

export function saveStoredAiConfig(config: Partial<AiConfig>) {
  if (config.apiKey !== undefined) {
    if (config.apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, config.apiKey.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }
  if (config.provider) {
    localStorage.setItem(AI_PROVIDER_STORAGE_KEY, config.provider);
  }
  if (config.baseUrl !== undefined) {
    localStorage.setItem(AI_BASE_URL_STORAGE_KEY, config.baseUrl.trim());
  }
}

const SYSTEM_PROMPT = `You are an expert visual diagram and knowledge synthesis assistant for an academic and research infinite canvas.
Generate a structured diagram representation matching the user's prompt.
You MUST output ONLY a valid JSON object matching this schema:
{
  "title": "Clear concise diagram title",
  "summary": "1-2 sentence description of the generated structure",
  "nodes": [
    {
      "type": "rectangle" | "diamond" | "circle" | "callout",
      "text": "Node content label",
      "width": 180,
      "height": 70
    }
  ],
  "edges": [
    {
      "fromIndex": 0,
      "toIndex": 1,
      "label": "optional edge label"
    }
  ]
}
Do NOT include markdown backticks or commentary. Only return raw JSON.`;

/**
 * Clean potential markdown wrappers from LLM output
 */
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Call Gemini 1.5 Flash API
 */
async function callGeminiApi(
  prompt: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<AiGenerationResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  const parsed = JSON.parse(cleanJsonString(rawText));
  return AiGenerationResultSchema.parse(parsed);
}

/**
 * Call OpenAI-compatible chat completions API
 */
async function callOpenAiApi(
  prompt: string,
  apiKey: string,
  baseUrl: string = 'https://api.openai.com/v1',
  signal?: AbortSignal
): Promise<AiGenerationResult> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('OpenAI API returned an empty response.');
  }

  const parsed = JSON.parse(cleanJsonString(rawText));
  return AiGenerationResultSchema.parse(parsed);
}

/**
 * Generate structured diagram via Real API or fallback
 */
export async function generateDiagramFromAi(
  prompt: string,
  config: AiConfig,
  signal?: AbortSignal
): Promise<AiGenerationResult> {
  if (config.apiKey.trim()) {
    if (config.provider === 'gemini') {
      return await callGeminiApi(prompt, config.apiKey.trim(), signal);
    } else {
      return await callOpenAiApi(prompt, config.apiKey.trim(), config.baseUrl, signal);
    }
  }

  throw new Error('No API key provided.');
}

/**
 * Convert validated AI nodes and edges into CanvasElements positioned at viewport center
 */
export function convertAiResultToCanvasElements(
  result: AiGenerationResult,
  centerX: number,
  centerY: number,
  mode: 'mindmap' | 'flowchart' | 'studymodule' | 'hypothesis' | 'summarize' | 'explain'
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const nodeElements: { id: string; x: number; y: number; width: number; height: number }[] = [];

  const defaultStyle: ElementStyle = {
    strokeColor: '#38bdf8',
    fillColor: 'transparent',
    strokeWidth: 2,
    strokeStyle: 'solid',
    opacity: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    cornerRadius: 10,
  };

  const count = result.nodes.length;

  result.nodes.forEach((node, idx) => {
    const shapeId = generateId(`ai_${node.type}`);
    const textId = generateId('txt');
    const width = node.width || 180;
    const height = node.height || 70;

    let x = centerX;
    let y = centerY;

    if (mode === 'mindmap') {
      if (idx === 0) {
        x = centerX - width / 2;
        y = centerY - height / 2;
      } else {
        const angle = ((idx - 1) / (count - 1)) * 2 * Math.PI - Math.PI / 2;
        const radius = 240;
        x = Math.round(centerX + radius * Math.cos(angle) - width / 2);
        y = Math.round(centerY + radius * Math.sin(angle) - height / 2);
      }
    } else if (mode === 'flowchart') {
      // Horizontal sequential layout
      const totalWidth = count * (width + 60);
      const startX = centerX - totalWidth / 2;
      x = Math.round(startX + idx * (width + 60));
      y = Math.round(centerY - height / 2);
    } else {
      // Grid/cluster layout
      const cols = Math.min(3, count);
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      x = Math.round(centerX - ((cols * (width + 40)) / 2) + col * (width + 40));
      y = Math.round(centerY - 100 + row * (height + 50));
    }

    const strokeColors = ['#38bdf8', '#a855f7', '#22c55e', '#eab308', '#f43f5e', '#06b6d4'];
    const fillColors = [
      'rgba(56, 189, 248, 0.15)',
      'rgba(168, 85, 247, 0.15)',
      'rgba(34, 197, 94, 0.15)',
      'rgba(234, 179, 8, 0.15)',
      'rgba(244, 63, 94, 0.15)',
      'rgba(6, 182, 212, 0.15)',
    ];

    const colorIdx = idx % strokeColors.length;

    // Push Shape Element based on type
    if (node.type === 'circle') {
      elements.push({
        id: shapeId,
        type: 'circle',
        x,
        y,
        width,
        height,
        radiusX: Math.round(width / 2),
        radiusY: Math.round(height / 2),
        rotation: 0,
        zIndex: idx * 2 + 1,
        style: {
          ...defaultStyle,
          strokeColor: strokeColors[colorIdx],
          fillColor: fillColors[colorIdx],
          strokeWidth: idx === 0 ? 2.5 : 2,
        },
      });
    } else if (node.type === 'diamond') {
      elements.push({
        id: shapeId,
        type: 'diamond',
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: idx * 2 + 1,
        style: {
          ...defaultStyle,
          strokeColor: strokeColors[colorIdx],
          fillColor: fillColors[colorIdx],
          strokeWidth: idx === 0 ? 2.5 : 2,
        },
      });
    } else if (node.type === 'callout') {
      elements.push({
        id: shapeId,
        type: 'callout',
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: idx * 2 + 1,
        text: node.text,
        pointerOffsetX: 20,
        pointerOffsetY: 20,
        style: {
          ...defaultStyle,
          strokeColor: strokeColors[colorIdx],
          fillColor: fillColors[colorIdx],
          strokeWidth: idx === 0 ? 2.5 : 2,
        },
      });
    } else {
      elements.push({
        id: shapeId,
        type: 'rectangle',
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: idx * 2 + 1,
        style: {
          ...defaultStyle,
          strokeColor: strokeColors[colorIdx],
          fillColor: fillColors[colorIdx],
          strokeWidth: idx === 0 ? 2.5 : 2,
        },
      });
    }

    // Push Text Element
    elements.push({
      id: textId,
      type: 'text',
      x: x + 10,
      y: y + height / 2 - 12,
      width: width - 20,
      height: 24,
      rotation: 0,
      zIndex: idx * 2 + 2,
      style: {
        ...defaultStyle,
        strokeColor: 'transparent',
        fillColor: '#ffffff',
        fontSize: idx === 0 ? 15 : 13,
      },
      text: node.text,
    });

    nodeElements.push({ id: shapeId, x, y, width, height });
  });

  // Create connectors for edges
  if (result.edges && result.edges.length > 0) {
    result.edges.forEach((edge, edgeIdx) => {
      if (
        edge.fromIndex >= 0 &&
        edge.fromIndex < nodeElements.length &&
        edge.toIndex >= 0 &&
        edge.toIndex < nodeElements.length
      ) {
        const fromNode = nodeElements[edge.fromIndex];
        const toNode = nodeElements[edge.toIndex];

        // Pick anchors based on relative positions
        let fromAnchor: 'top' | 'right' | 'bottom' | 'left' = 'right';
        let toAnchor: 'top' | 'right' | 'bottom' | 'left' = 'left';

        if (mode === 'mindmap') {
          if (toNode.x > fromNode.x) {
            fromAnchor = 'right';
            toAnchor = 'left';
          } else {
            fromAnchor = 'left';
            toAnchor = 'right';
          }
        }

        elements.push({
          id: generateId('conn'),
          type: 'connector',
          fromElementId: fromNode.id,
          toElementId: toNode.id,
          fromAnchor,
          toAnchor,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          rotation: 0,
          zIndex: count * 2 + edgeIdx + 1,
          style: {
            ...defaultStyle,
            strokeColor: '#94a3b8',
            strokeWidth: 2,
            strokeStyle: 'solid',
          },
        });
      }
    });
  } else if (mode === 'mindmap' && nodeElements.length > 1) {
    // Default mindmap edges from root (index 0) to all other nodes
    const root = nodeElements[0];
    for (let i = 1; i < nodeElements.length; i++) {
      const child = nodeElements[i];
      elements.push({
        id: generateId('conn'),
        type: 'connector',
        fromElementId: root.id,
        toElementId: child.id,
        fromAnchor: child.x > root.x ? 'right' : 'left',
        toAnchor: child.x > root.x ? 'left' : 'right',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: count * 2 + i,
        style: {
          ...defaultStyle,
          strokeColor: '#38bdf8',
          strokeWidth: 2,
        },
      });
    }
  } else if (mode === 'flowchart' && nodeElements.length > 1) {
    // Default sequential edges
    for (let i = 0; i < nodeElements.length - 1; i++) {
      elements.push({
        id: generateId('conn'),
        type: 'connector',
        fromElementId: nodeElements[i].id,
        toElementId: nodeElements[i + 1].id,
        fromAnchor: 'right',
        toAnchor: 'left',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: count * 2 + i,
        style: {
          ...defaultStyle,
          strokeColor: '#38bdf8',
          strokeWidth: 2,
        },
      });
    }
  }

  return elements;
}
