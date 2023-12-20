export function detectImageFormat(buffer: Buffer | undefined): string | null {
  if (!buffer || buffer.length < 2) {
    return null;
  }

  const firstByte = buffer[0];
  const secondByte = buffer[1];

  if (firstByte === 0xff && secondByte === 0xd8) {
    return "image/jpeg";
  } else if (firstByte === 0x89 && secondByte === 0x50) {
    return "image/png";
  }

  return null;
}
