import React, { useCallback } from 'react';
import { CanvasElement } from '../../types/canvas';
import { RectElement } from './elements/RectElement';
import { CircleElement } from './elements/CircleElement';
import { DiamondElement } from './elements/DiamondElement';
import { PolygonElement } from './elements/PolygonElement';
import { CalloutElement } from './elements/CalloutElement';
import { ArrowElement } from './elements/ArrowElement';
import { LineElement } from './elements/LineElement';
import { ConnectorElement } from './elements/ConnectorElement';
import { FreehandElement } from './elements/FreehandElement';
import { TextElement } from './elements/TextElement';
import { StickyElement } from './elements/StickyElement';
import { ImageElement } from './elements/ImageElement';
import { TableElement } from './elements/TableElement';
import Konva from 'konva';

interface Props {
  element: CanvasElement;
  allElements: CanvasElement[];
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDoubleClick: (id: string) => void;
  onChange: (id: string, updates: Partial<CanvasElement>, commit?: boolean) => void;
}

export const ElementRenderer: React.FC<Props> = React.memo(({
  element,
  allElements,
  isSelected,
  isDraggable,
  onSelect,
  onDoubleClick,
  onChange,
}) => {
  const handleSelect = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      onSelect(element.id, e);
    },
    [element.id, onSelect]
  );

  const handleDoubleClick = useCallback(() => {
    onDoubleClick(element.id);
  }, [element.id, onDoubleClick]);

  const handleChange = useCallback(
    (updates: Partial<CanvasElement>, commit?: boolean) => {
      onChange(element.id, updates, commit);
    },
    [element.id, onChange]
  );

  if (element.isHidden) return null;

  switch (element.type) {
    case 'rectangle':
      return (
        <RectElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'circle':
      return (
        <CircleElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'diamond':
      return (
        <DiamondElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'polygon':
      return (
        <PolygonElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'callout':
      return (
        <CalloutElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
          onChange={handleChange}
        />
      );
    case 'arrow':
      return (
        <ArrowElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'line':
      return (
        <LineElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'connector':
      return (
        <ConnectorElement
          element={element}
          allElements={allElements}
          isSelected={isSelected}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'pencil':
      return (
        <FreehandElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'text':
      return (
        <TextElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
          onChange={handleChange}
        />
      );
    case 'sticky':
      return (
        <StickyElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
          onChange={handleChange}
        />
      );
    case 'image':
      return (
        <ImageElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    case 'table':
      return (
        <TableElement
          element={element}
          isSelected={isSelected}
          isDraggable={isDraggable && !element.isLocked}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );
    default:
      return null;
  }
});
