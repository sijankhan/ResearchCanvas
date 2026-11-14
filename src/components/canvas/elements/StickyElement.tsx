import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { StickyCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: StickyCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDoubleClick: () => void;
  onChange: (updates: Partial<StickyCanvasElement>, commit?: boolean) => void;
}

export const StickyElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onDoubleClick,
  onChange,
}) => {
  const { style, width, height, text } = element;
  const bgColor = style.fillColor || element.color || '#fef08a';

  return (
    <Group
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
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
    >
      {/* Sticky note card body with shadow */}
      <Rect
        width={width}
        height={height}
        fill={bgColor}
        stroke={style.strokeColor || 'rgba(0,0,0,0.1)'}
        strokeWidth={1}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={12}
        shadowOffset={{ x: 0, y: 4 }}
        shadowOpacity={0.25}
      />
      {/* Top subtle highlight band */}
      <Rect
        width={width}
        height={8}
        fill="rgba(0,0,0,0.06)"
        cornerRadius={[8, 8, 0, 0]}
      />
      {/* Text inside the sticky note */}
      <Text
        x={14}
        y={18}
        width={Math.max(20, width - 28)}
        height={Math.max(20, height - 28)}
        text={text || 'Double-click to write note...'}
        fontSize={style.fontSize || 16}
        fontFamily={style.fontFamily || 'Inter'}
        fill="#1e293b" // high contrast dark slate on sticky note
        lineHeight={1.4}
        wrap="word"
        ellipsis={false}
      />
    </Group>
  );
});
