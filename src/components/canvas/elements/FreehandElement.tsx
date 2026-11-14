import React from 'react';
import { Line } from 'react-konva';
import { PencilCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: PencilCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<PencilCanvasElement>, commit?: boolean) => void;
}

export const FreehandElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { style } = element;
  const points = element.points || [];

  return (
    <Line
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      points={points}
      stroke={style.strokeColor}
      strokeWidth={style.strokeWidth}
      opacity={style.opacity}
      tension={0.4}
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
