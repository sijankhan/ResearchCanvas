import React from 'react';
import { Text } from 'react-konva';
import { TextCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: TextCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDoubleClick: () => void;
  onChange: (updates: Partial<TextCanvasElement>, commit?: boolean) => void;
}

export const TextElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onDoubleClick,
  onChange,
}) => {
  const { style } = element;

  return (
    <Text
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      width={element.width || undefined}
      text={element.text || 'Type something...'}
      fontSize={style.fontSize || 18}
      fontFamily={style.fontFamily || 'Inter'}
      fill={style.fillColor === 'transparent' ? '#ffffff' : style.fillColor}
      opacity={style.opacity}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDblTap={onDoubleClick}
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
