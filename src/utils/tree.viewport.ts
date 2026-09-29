export const clampZoom = (zoom: number, minZoom: number, maxZoom: number): number | null => {
  if (
    !Number.isFinite(zoom) ||
    !Number.isFinite(minZoom) ||
    !Number.isFinite(maxZoom) ||
    minZoom <= 0 ||
    maxZoom < minZoom
  ) {
    return null;
  }

  return Math.min(Math.max(zoom, minZoom), maxZoom);
};



