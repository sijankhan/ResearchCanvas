import React from 'react';
import { Line } from 'react-konva';
import { PolygonCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: PolygonCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<PolygonCanvasElement>, commit?: boolean) => void;
}

export const PolygonElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const { sides = 5, width, height, style } = element;
  const rx = width / 2;
  const ry = height / 2;
  const points: number[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    points.push(rx + rx * Math.cos(angle));
    points.push(ry + ry * Math.sin(angle));
  }

  const isDashed = style.strokeStyle === 'dashed';

  return (
    <Line
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      points={points}
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
        onChange({ x: e.target.x(), y: e.target.y() }, false);
      }}
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() }, true);
      }}
    />
  );
});
