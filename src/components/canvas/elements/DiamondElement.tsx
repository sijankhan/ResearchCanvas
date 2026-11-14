import React from 'react';
import { Line } from 'react-konva';
import { DiamondCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: DiamondCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<DiamondCanvasElement>, commit?: boolean) => void;
}

export const DiamondElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { style, width, height } = element;
  const isDashed = style.strokeStyle === 'dashed';
  const halfW = width / 2;
  const halfH = height / 2;
  const diamondPoints = [halfW, 0, width, halfH, halfW, height, 0, halfH];

  return (
    <Line
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      points={diamondPoints}
      closed={true}
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
