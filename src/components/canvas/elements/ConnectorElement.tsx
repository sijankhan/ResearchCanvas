import React from 'react';
import { Arrow, Text, Group, Circle } from 'react-konva';
import { ConnectorCanvasElement, CanvasElement, AnchorPosition } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: ConnectorCanvasElement;
  allElements: CanvasElement[];
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<ConnectorCanvasElement>, commit?: boolean) => void;
}

function getAnchorPoint(el: CanvasElement, anchor: AnchorPosition): { x: number; y: number } {
  let cx = el.x;
  let cy = el.y;
  let w = el.width;
  let h = el.height;

  if (el.type === 'circle') {
    const rx = Math.abs(el.radiusX);
    const ry = Math.abs(el.radiusY);
    switch (anchor) {
      case 'top': return { x: el.x, y: el.y - ry };
      case 'bottom': return { x: el.x, y: el.y + ry };
      case 'left': return { x: el.x - rx, y: el.y };
      case 'right': return { x: el.x + rx, y: el.y };
      case 'center': return { x: el.x, y: el.y };
    }
  }

  switch (anchor) {
    case 'top': return { x: cx + w / 2, y: cy };
    case 'bottom': return { x: cx + w / 2, y: cy + h };
    case 'left': return { x: cx, y: cy + h / 2 };
    case 'right': return { x: cx + w, y: cy + h / 2 };
    case 'center': return { x: cx + w / 2, y: cy + h / 2 };
  }
}

export const ConnectorElement: React.FC<Props> = React.memo(({
  element,
  allElements,
  onSelect,
}) => {
  const fromEl = allElements.find((e) => e.id === element.fromElementId);
  const toEl = allElements.find((e) => e.id === element.toElementId);

  let fromPoint = { x: element.x, y: element.y };
  let toPoint = { x: element.x + (element.width || 100), y: element.y + (element.height || 0) };

  if (fromEl) {
    fromPoint = getAnchorPoint(fromEl, element.fromAnchor || 'right');
  }
  if (toEl) {
    toPoint = getAnchorPoint(toEl, element.toAnchor || 'left');
  }

  const { style, label } = element;
  const isDashed = style.strokeStyle === 'dashed';
  const midX = (fromPoint.x + toPoint.x) / 2;
  const midY = (fromPoint.y + toPoint.y) / 2;

  return (
    <Group
      id={element.id}
      name="canvas-element"
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Anchor indicator circles */}
      <Circle
        x={fromPoint.x}
        y={fromPoint.y}
        radius={3.5}
        fill={style.strokeColor}
        opacity={0.8}
      />
      <Arrow
        points={[fromPoint.x, fromPoint.y, toPoint.x, toPoint.y]}
        pointerLength={Math.max(10, style.strokeWidth * 3.5)}
        pointerWidth={Math.max(10, style.strokeWidth * 3.5)}
        fill={style.strokeColor}
        stroke={style.strokeColor}
        strokeWidth={style.strokeWidth || 2}
        dash={isDashed ? [8, 6] : undefined}
        opacity={style.opacity}
        lineCap="round"
        lineJoin="round"
      />
      {label && (
        <Group x={midX} y={midY - 14}>
          <Text
            text={label}
            fontSize={12}
            fontFamily="Inter"
            fill="#e2e8f0"
            padding={4}
            align="center"
          />
        </Group>
      )}
    </Group>
  );
});
