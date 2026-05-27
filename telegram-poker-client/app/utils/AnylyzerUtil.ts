import React from "react";

type AnylyzeZoneReturn = string | null;

export const analyzeZone = async (
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
): Promise<AnylyzeZoneReturn> => {
  if (video && canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      // Размеры рамки (соответствуют CSS)
      const rectWidth = 200;
      const rectHeight = 300;

      // Вычисляем координаты центра
      const startX = (video.videoWidth - rectWidth) / 2;
      const startY = (video.videoHeight - rectHeight) / 2;

      canvas.width = rectWidth;
      canvas.height = rectHeight;

      // 1. Вырезаем зону из видео и рисуем на канвас
      ctx.drawImage(
        video,
        startX,
        startY,
        rectWidth,
        rectHeight,
        0,
        0,
        rectWidth,
        rectHeight,
      );

      // 2. Берем центральный пиксель для анализа цвета
      const pixel = ctx.getImageData(rectWidth / 2, rectHeight / 2, 1, 1).data;
      const [r, g, b] = pixel;

      // 3. Простая логика определения цвета
      if (r > 150 && g < 100 && b < 100) {
        return "RED (Hearts/Diamonds)";
      } else if (r < 100 && g < 100 && b < 100) {
        return "BLACK (Spades/Clubs)";
      } else {
        return null;
      }
    }
  }
  return null;
};
