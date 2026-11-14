/**
 * Distance between point (px, py) and line segment (x1, y1) -> (x2, y2)
 */
function perpendicularDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const mag = Math.hypot(dx, dy);

  if (mag === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  const u = ((px - x1) * dx + (py - y1) * dy) / (mag * mag);

  if (u < 0) {
    return Math.hypot(px - x1, py - y1);
  }
  if (u > 1) {
    return Math.hypot(px - x2, py - y2);
  }

  const ix = x1 + u * dx;
  const iy = y1 + u * dy;
  return Math.hypot(px - ix, py - iy);
}

/**
 * Simplifies a 2D polyline [x0, y0, x1, y1, ...] using the Ramer-Douglas-Peucker algorithm.
 */
export function simplifyRDP(points: number[], epsilon = 1.5): number[] {
  if (points.length <= 4) return points;

  const count = points.length / 2;
  const firstX = points[0];
  const firstY = points[1];
  const lastX = points[points.length - 2];
  const lastY = points[points.length - 1];

  let maxDist = 0;
  let maxIdx = 0;

  for (let i = 1; i < count - 1; i++) {
    const px = points[i * 2];
    const py = points[i * 2 + 1];
    const d = perpendicularDistance(px, py, firstX, firstY, lastX, lastY);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    const leftPoints = points.slice(0, (maxIdx + 1) * 2);
    const rightPoints = points.slice(maxIdx * 2);

    const recLeft = simplifyRDP(leftPoints, epsilon);
    const recRight = simplifyRDP(rightPoints, epsilon);

    return recLeft.slice(0, -2).concat(recRight);
  } else {
    return [firstX, firstY, lastX, lastY];
  }
}
