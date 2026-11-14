import React from 'react';
import { Arrow } from 'react-konva';
import { ArrowCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: ArrowCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<ArrowCanvasElement>, commit?: boolean) => void;
}

export const ArrowElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { style } = element;
  const isDashed = style.strokeStyle === 'dashed';
  const points = element.points && element.points.length >= 4 ? element.points : [0, 0, element.width || 100, element.height || 0];

  return (
    <Arrow
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      points={points}
      pointerLength={Math.max(10, style.strokeWidth * 3.5)}
      pointerWidth={Math.max(10, style.strokeWidth * 3.5)}
      fill={style.strokeColor}
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
