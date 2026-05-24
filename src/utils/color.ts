export function hexToRgba(hexStr: string, alpha: number): string {
  try {
    const cleanHex = hexStr.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(220, 220, 225, ${alpha})`;
  }
}
