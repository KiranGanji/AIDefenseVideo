export const COLORS = {
  // Backgrounds
  darkBg: "#0A0E1A",
  lightBg: "#FFFFFF",
  // Accents
  blue: "#378ADD",
  blueDark: "#185FA5",
  blueLight: "#E6F1FB",
  red: "#E24B4A",
  redLight: "#FCEBEB",
  green: "#4A8F2A",
  greenLight: "#EAF3DE",
  amber: "#D97706",
  amberLight: "#FAEEDA",
  purple: "#5B4FCF",
  purpleLight: "#EEEDFE",
  teal: "#0D9470",
  tealLight: "#E1F5EE",
  // Text
  textWhite: "#FFFFFF",
  textDark: "#1A1A1A",
  textMid: "#444441",
  textMuted: "rgba(0,0,0,0.45)",
};

export const FONTS = {
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// Scene timing in frames at 30fps  ·  Total: ~222s = 6660 frames
// ARCH extended by 360 frames (12s) to hold $50M callout after 20s delay
export const SCENES = {
  THREAT:    { start: 0,    duration: 660  }, // 0:00–0:22
  ARCH:      { start: 660,  duration: 1050 }, // 0:22–0:57  (+12s for $50M delay)
  RADAR:     { start: 1710, duration: 900  }, // 0:57–1:27
  SIMULATOR: { start: 2610, duration: 1050 }, // 1:27–2:02
  RETRO:     { start: 3660, duration: 750  }, // 2:02–2:27
  GRAPH:     { start: 4410, duration: 900  }, // 2:27–2:57
  CLOSING:   { start: 5310, duration: 1050 }, // 2:57–3:32
};
