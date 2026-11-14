import React from 'react';
import { Ellipse } from 'react-konva';
import { CircleCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: CircleCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<CircleCanvasElement>, commit?: boolean) => void;
}

export const CircleElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { style } = element;
  const isDashed = style.strokeStyle === 'dashed';

  return (
    <Ellipse
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      radiusX={Math.max(4, Math.abs(element.radiusX))}
      radiusY={Math.max(4, Math.abs(element.radiusY))}
      rotation={element.rotation}
      fill={style.fillColor}
      stroke={style.strokeColor}
      strokeWidth={style.strokeWidth}
      dash={isDashed ? [8, 6] : undefined}
      opacity={style.opacity}
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
