import React, { useState, useEffect } from 'react';
import { Group, Rect, Image as KonvaImage, Text, Circle } from 'react-konva';
import { ImageCanvasElement } from '../../../types/canvas';
import { getImage, getCachedImage } from '../../../services/imageStore';
import Konva from 'konva';

interface Props {
  element: ImageCanvasElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<ImageCanvasElement>, commit?: boolean) => void;
}

export const ImageElement: React.FC<Props> = React.memo(({
  element,
  isDraggable,
  onSelect,
  onChange,
}) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [activePinId, setActivePinId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadImage = (srcUrl: string) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = srcUrl;
      img.onload = () => {
        if (!isCancelled) {
          setImageObj(img);
        }
      };
    };

    if (element.imageId) {
      const cached = getCachedImage(element.imageId);
      if (cached) {
        loadImage(cached);
      } else {
        getImage(element.imageId).then((url) => {
          if (!isCancelled && url) {
            loadImage(url);
          } else if (!isCancelled && element.src) {
            loadImage(element.src);
          }
        });
      }
    } else if (element.src) {
      loadImage(element.src);
    }

    return () => {
      isCancelled = true;
    };
  }, [element.src, element.imageId]);

  const { style, width, height, caption, annotations } = element;
  const captionHeight = caption ? 32 : 0;
  const totalHeight = height + captionHeight;

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
      {/* Background card container */}
      <Rect
        width={width}
        height={totalHeight}
        fill="#181a20"
        stroke={style.strokeColor || '#2e323b'}
        strokeWidth={style.strokeWidth || 1.5}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={16}
        shadowOpacity={0.25}
        shadowOffset={{ x: 0, y: 6 }}
      />

      {/* Rendered Image */}
      {imageObj && (
        <KonvaImage
          image={imageObj}
          width={width}
          height={height}
          cornerRadius={caption ? [8, 8, 0, 0] : 8}
        />
      )}

      {/* Optional Caption */}
      {caption && (
        <Group y={height}>
          <Rect
            width={width}
            height={captionHeight}
            fill="#121316"
            cornerRadius={[0, 0, 8, 8]}
          />
          <Text
            x={12}
            y={8}
            width={width - 24}
            text={caption}
            fontSize={12}
            fontFamily="Inter"
            fill="#94a3b8"
            fontStyle="italic"
            ellipsis={true}
            wrap="none"
          />
        </Group>
      )}

      {/* Interactive Annotation Pins */}
      {annotations && annotations.map((ann, idx) => {
        const pinX = (ann.x / (element.naturalWidth || width)) * width;
        const pinY = (ann.y / (element.naturalHeight || height)) * height;
        const isActive = activePinId === ann.id;

        return (
          <Group
            key={ann.id}
            x={pinX}
            y={pinY}
            onClick={(e) => {
              e.cancelBubble = true;
              setActivePinId(isActive ? null : ann.id);
            }}
          >
            {/* Outer pulsating ring */}
            <Circle
              radius={10}
              fill="rgba(56, 189, 248, 0.3)"
              stroke="#38bdf8"
              strokeWidth={1.5}
            />
            {/* Center dot */}
            <Circle
              radius={5}
              fill="#38bdf8"
            />
            {/* Pin index number */}
            <Text
              x={-3}
              y={-5}
              text={`${idx + 1}`}
              fontSize={10}
              fontFamily="Inter"
              fontStyle="bold"
              fill="#0f172a"
            />

            {/* Expanded annotation popover card */}
            {isActive && (
              <Group x={14} y={-10}>
                <Rect
                  width={200}
                  height={65}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth={1}
                  cornerRadius={6}
                  shadowColor="black"
                  shadowBlur={10}
                  shadowOpacity={0.4}
                />
                <Text
                  x={10}
                  y={8}
                  width={180}
                  text={ann.title}
                  fontSize={11}
                  fontFamily="Inter"
                  fontStyle="bold"
                  fill="#38bdf8"
                  wrap="none"
                  ellipsis={true}
                />
                <Text
                  x={10}
                  y={24}
                  width={180}
                  text={ann.description}
                  fontSize={10}
                  fontFamily="Inter"
                  fill="#cbd5e1"
                  wrap="word"
                />
              </Group>
            )}
          </Group>
        );
      })}
    </Group>
  );
});
