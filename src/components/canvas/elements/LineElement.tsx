import React from 'react';
import { Line } from 'react-konva';
import { LineCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: LineCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<LineCanvasElement>, commit?: boolean) => void;
}

export const LineElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { style } = element;
  const isDashed = style.strokeStyle === 'dashed';
  const points = element.points && element.points.length >= 4 ? element.points : [0, 0, element.width || 100, element.height || 0];

  return (
    <Line
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      points={points}
      stroke={style.strokeColor}
      strokeWidth={style.strokeWidth}
      dash={isDashed ? [8, 6] : undefined}
      opacity={style.opacity}
      lineCap="round"
      lineJoin="round"
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        }, false);
      }}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        }, true);
      }}
    />
  );
});
