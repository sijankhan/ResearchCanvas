import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import { TableCanvasElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/useCanvasStore';
import Konva from 'konva';

interface Props {
  element: TableCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDoubleClickCell?: (row: number, col: number) => void;
  onChange: (updates: Partial<TableCanvasElement>, commit?: boolean) => void;
}

export const TableElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const {
    rows,
    cols,
    headers,
    data,
    colWidths,
    rowHeight = 44,
    style,
    width,
  } = element;

  const theme = useCanvasStore((s) => s.theme);
  const actualColWidths = colWidths && colWidths.length === cols
    ? colWidths
    : Array(cols).fill(Math.max(80, width / cols));

  const totalWidth = actualColWidths.reduce((a, b) => a + b, 0);
  const totalHeight = (rows + 1) * rowHeight;

  return (
    <Group
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() }, false);
      }}
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() }, true);
      }}
    >
      {/* Outer border & shadow container */}
      <Rect
        width={totalWidth}
        height={totalHeight}
        fill={
          style.fillColor && style.fillColor !== 'transparent'
            ? style.fillColor
            : theme === 'dark'
              ? '#181a20'
              : '#ffffff'
        }
        stroke={style.strokeColor || '#38bdf8'}
        strokeWidth={style.strokeWidth || 1.5}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={16}
        shadowOpacity={0.25}
        shadowOffset={{ x: 0, y: 6 }}
      />

      {/* Header row background */}
      <Rect
        width={totalWidth}
        height={rowHeight}
        fill="rgba(56, 189, 248, 0.12)"
        cornerRadius={[8, 8, 0, 0]}
      />

      {/* Column vertical dividers */}
      {actualColWidths.map((_, colIdx) => {
        if (colIdx === 0) return null;
        const curX = actualColWidths.slice(0, colIdx).reduce((a, b) => a + b, 0);
        return (
          <Line
            key={`v_line_${colIdx}`}
            points={[curX, 0, curX, totalHeight]}
            stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.1)'}
            strokeWidth={1}
          />
        );
      })}

      {/* Row horizontal dividers */}
      {Array.from({ length: rows + 1 }).map((_, rIdx) => {
        const curY = (rIdx + 1) * rowHeight;
        if (curY >= totalHeight) return null;
        return (
          <Line
            key={`h_line_${rIdx}`}
            points={[0, curY, totalWidth, curY]}
            stroke={
              rIdx === 0
                ? style.strokeColor || '#38bdf8'
                : theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(15, 23, 42, 0.1)'
            }
            strokeWidth={rIdx === 0 ? 1.5 : 1}
          />
        );
      })}

      {/* Header labels */}
      {headers.map((h, colIdx) => {
        const curX = actualColWidths.slice(0, colIdx).reduce((a, b) => a + b, 0);
        const colW = actualColWidths[colIdx];
        return (
          <Text
            key={`h_text_${colIdx}`}
            x={curX + 12}
            y={14}
            width={colW - 24}
            text={h}
            fontSize={13}
            fontFamily="Inter"
            fontStyle="bold"
            fill="#38bdf8"
            wrap="none"
            ellipsis={true}
          />
        );
      })}

      {/* Data cell values */}
      {data.map((row, rIdx) => {
        const curY = (rIdx + 1) * rowHeight;
        return row.map((val, cIdx) => {
          const curX = actualColWidths.slice(0, cIdx).reduce((a, b) => a + b, 0);
          const colW = actualColWidths[cIdx];
          return (
            <Text
              key={`cell_${rIdx}_${cIdx}`}
              x={curX + 12}
              y={curY + 14}
              width={colW - 24}
              text={val}
              fontSize={12}
              fontFamily="Inter"
              fill={theme === 'dark' ? '#e2e8f0' : '#1e293b'}
              wrap="none"
              ellipsis={true}
            />
          );
        });
      })}
    </Group>
  );
});
