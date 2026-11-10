// SVG/HTML color helper avoids CSS string injection and retains hex alpha.
export function colorWithOpacity(hex: string, opacity: number): string {
  if (!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex) || !Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    throw new Error('colorWithOpacity requires a validated hex color and opacity in [0, 1].');
  }
  let digits = hex.slice(1);
  if (digits.length <= 4) digits = [...digits].map((d) => d + d).join('');
  const red = parseInt(digits.slice(0, 2), 16);
  const green = parseInt(digits.slice(2, 4), 16);
  const blue = parseInt(digits.slice(4, 6), 16);
  const alpha = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
  return `rgba(${red}, ${green}, ${blue}, ${alpha * opacity})`;
}
