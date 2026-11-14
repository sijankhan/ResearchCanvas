import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasElement } from '../../types/canvas';

interface Props {
  selectedIds: string[];
  elements: CanvasElement[];
  stageRef: React.RefObject<Konva.Stage>;
  onTransformEnd: (id: string, updates: Partial<CanvasElement>) => void;
}

export const SelectionTransformer: React.FC<Props> = ({
  selectedIds,
  stageRef,
  onTransformEnd,
}) => {
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    if (selectedIds.length === 0) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }

    const nodes: Konva.Node[] = [];
    selectedIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        nodes.push(node);
      }
    });

    trRef.current.nodes(nodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  if (selectedIds.length === 0) return null;

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Enforce minimum dimension
        if (Math.abs(newBox.width) < 15 || Math.abs(newBox.height) < 15) {
          return oldBox;
        }
        return newBox;
      }}
      anchorFill="#0f172a"
      anchorStroke="#38bdf8"
      anchorStrokeWidth={2}
      anchorSize={8}
      anchorCornerRadius={2}
      borderStroke="#38bdf8"
      borderStrokeWidth={1.5}
      borderDash={[4, 4]}
      rotateAnchorOffset={24}
      padding={4}
      keepRatio={false}
      onTransformEnd={() => {
        if (!trRef.current) return;
        const nodes = trRef.current.nodes();
        nodes.forEach((node) => {
          const id = node.id();
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale so width/height take effect
          node.scaleX(1);
          node.scaleY(1);

          const className = node.getClassName();
          const updates: Partial<CanvasElement> = {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            rotation: Math.round(node.rotation()),
          };

          if (className === 'Ellipse') {
            const ellipse = node as Konva.Ellipse;
            updates.width = Math.round(Math.max(10, ellipse.radiusX() * 2 * Math.abs(scaleX)));
            updates.height = Math.round(Math.max(10, ellipse.radiusY() * 2 * Math.abs(scaleY)));
            (updates as any).radiusX = Math.round(Math.max(5, ellipse.radiusX() * Math.abs(scaleX)));
            (updates as any).radiusY = Math.round(Math.max(5, ellipse.radiusY() * Math.abs(scaleY)));
          } else {
            updates.width = Math.round(Math.max(15, node.width() * Math.abs(scaleX)));
            updates.height = Math.round(Math.max(15, node.height() * Math.abs(scaleY)));
          }

          onTransformEnd(id, updates);
        });
      }}
    />
  );
};
