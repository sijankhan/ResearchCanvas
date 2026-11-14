import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import { CalloutCanvasElement } from '../../../types/canvas';
import Konva from 'konva';

interface Props {
  element: CalloutCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDoubleClick?: () => void;
  onChange: (updates: Partial<CalloutCanvasElement>, commit?: boolean) => void;
}

export const CalloutElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onDoubleClick,
  onChange,
}) => {
  const { width, height, text, style, pointerOffsetX = -30, pointerOffsetY = 20 } = element;
  const isDashed = style.strokeStyle === 'dashed';

  // Triangle pointer points
  const bubbleBottom = height;
  const pointerBaseLeft = Math.max(15, width * 0.2);
  const pointerBaseRight = pointerBaseLeft + 25;
  const pointerTipX = pointerBaseLeft + pointerOffsetX;
  const pointerTipY = bubbleBottom + pointerOffsetY;

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
      onDragMove={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() }, false);
      }}
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() }, true);
      }}
    >
      {/* Speech pointer tail */}
      <Line
        points={[pointerBaseLeft, bubbleBottom - 2, pointerTipX, pointerTipY, pointerBaseRight, bubbleBottom - 2]}
        closed={true}
        fill={style.fillColor || 'rgba(234, 179, 8, 0.15)'}
        stroke={style.strokeColor || '#eab308'}
        strokeWidth={style.strokeWidth || 1.5}
      />

      {/* Main bubble body */}
      <Rect
        width={width}
        height={height}
        fill={style.fillColor || 'rgba(234, 179, 8, 0.15)'}
        stroke={style.strokeColor || '#eab308'}
        strokeWidth={style.strokeWidth || 1.5}
        cornerRadius={12}
        dash={isDashed ? [8, 6] : undefined}
        opacity={style.opacity}
      />

      {/* Text inside */}
      <Text
        x={12}
        y={12}
        width={width - 24}
        height={height - 24}
        text={text}
        fontSize={style.fontSize || 14}
        fontFamily={style.fontFamily || 'Inter'}
        fill="#f8fafc"
        wrap="word"
        lineHeight={1.4}
      />
    </Group>
  );
});
