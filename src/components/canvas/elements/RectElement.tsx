import React from 'react';
import { Rect } from 'react-konva';
import { RectCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: RectCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<RectCanvasElement>, commit?: boolean) => void;
}

export const RectElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { style } = element;
  const isDashed = style.strokeStyle === 'dashed';

  return (
    <Rect
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      fill={style.fillColor}
      stroke={style.strokeColor}
      strokeWidth={style.strokeWidth}
      dash={isDashed ? [8, 6] : undefined}
      opacity={style.opacity}
      cornerRadius={style.cornerRadius ?? 8}
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
