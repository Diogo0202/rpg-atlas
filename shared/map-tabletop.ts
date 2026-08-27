export const MAP_COORDINATE_MAX = 10_000;

export function clampMapCoordinate(value: number) {
  return Math.round(Math.min(MAP_COORDINATE_MAX, Math.max(0, value)));
}

export function normalizedMapCoordinate(relative: number) {
  return clampMapCoordinate(relative * MAP_COORDINATE_MAX);
}

export function mapCoordinatePercent(value: number) {
  return (clampMapCoordinate(value) / 100).toFixed(2);
}
