import React from 'react';
import { Shape } from 'react-konva';
import { Camera, GridType } from '../../types/canvas';

interface Props {
  width: number;
  height: number;
  camera: Camera;
  gridType: GridType;
}

export const InfiniteGrid: React.FC<Props> = ({
  width,
  height,
  camera,
  gridType,
}) => {
  if (gridType === 'none') return null;

  return (
    <Shape
      listening={false}
      sceneFunc={(context) => {
        const { x, y, zoom } = camera;

        // Base grid size in world units
        let baseStep = 32;
        if (zoom < 0.3) baseStep = 128;
        else if (zoom < 0.6) baseStep = 64;

        const step = baseStep * zoom;
        const offsetX = (x % step + step) % step;
        const offsetY = (y % step + step) % step;

        context.beginPath();

        if (gridType === 'dots') {
          context.fillStyle = 'rgba(255, 255, 255, 0.12)';
          const dotRadius = Math.max(1, 1.2 * Math.min(1.5, Math.max(0.6, zoom)));

          for (let gx = offsetX; gx < width; gx += step) {
            for (let gy = offsetY; gy < height; gy += step) {
              context.moveTo(gx + dotRadius, gy);
              context.arc(gx, gy, dotRadius, 0, Math.PI * 2);
            }
          }
          context.fill();
        } else if (gridType === 'lines') {
          context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          context.lineWidth = 1;

          for (let gx = offsetX; gx < width; gx += step) {
            context.moveTo(gx, 0);
            context.lineTo(gx, height);
          }

          for (let gy = offsetY; gy < height; gy += step) {
            context.moveTo(0, gy);
            context.lineTo(width, gy);
          }
          context.stroke();
        }
      }}
    />
  );
};
