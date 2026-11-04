export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  if (h === 0) h = 1;
  return h;
}

export function hashToUint32(str: string): number {
  let h = hashString(str);
  if (h < 0) h = 0x100000000 + h;
  return h >>> 0;
}

export function pickCoverPalette(
  title: string,
  theme: "kertas" | "malam" | "sepia" | "kontras",
): { bg: string; fg: string } {
  const palette: Record<
    "kertas" | "malam" | "sepia" | "kontras",
    Array<{ bg: string; fg: string }>
  > = {
    kertas: [
      { bg: "#E6DFD0", fg: "#1F1B16" },
      { bg: "#F3EEE4", fg: "#8E2A1F" },
      { bg: "#1F1B16", fg: "#FBF8F2" },
      { bg: "#8E2A1F", fg: "#FFF8F0" },
    ],
    malam: [
      { bg: "#28241E", fg: "#EFE8DA" },
      { bg: "#1C1915", fg: "#E58F7A" },
      { bg: "#EFE8DA", fg: "#14120F" },
      { bg: "#E58F7A", fg: "#2A0E08" },
    ],
    sepia: [
      { bg: "#E8D6B0", fg: "#3B2F20" },
      { bg: "#F1E4C8", fg: "#7A2E1B" },
      { bg: "#3B2F20", fg: "#F1E4C8" },
      { bg: "#7A2E1B", fg: "#FBE9C8" },
    ],
    kontras: [
      { bg: "#000000", fg: "#FFFFFF" },
      { bg: "#FFFFFF", fg: "#000000" },
      { bg: "#0A1838", fg: "#FFFFFF" },
      { bg: "#FFFFFF", fg: "#0A1838" },
    ],
  };

  const colors = palette[theme] ?? palette["kertas"];
  const index = hashToUint32(title) % colors.length;
  return colors[index];
}

export function toPseudoRandomOrdinal(
  title: string,
  seed: number,
): number {
  const h = hashToUint32(title);
  const m = Math.imul(0x2545F491, seed);
  return Math.floor((h ^ m) % 0xffffff);
}

export function formatEditionNumber(index: number): string {
  return `No. ${index.toString().padStart(4, "0")}`;
}
