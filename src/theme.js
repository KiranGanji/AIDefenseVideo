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

// Scene timing in frames at 30fps  ·  Total: 210s = 6300 frames
export const SCENES = {
  THREAT:    { start: 0,    duration: 660  }, // 0:00–0:22
  ARCH:      { start: 660,  duration: 690  }, // 0:22–0:45
  RADAR:     { start: 1350, duration: 900  }, // 0:45–1:15
  SIMULATOR: { start: 2250, duration: 1050 }, // 1:15–1:50
  RETRO:     { start: 3300, duration: 750  }, // 1:50–2:15
  GRAPH:     { start: 4050, duration: 900  }, // 2:15–2:45
  CLOSING:   { start: 4950, duration: 1050 }, // 2:45–3:20
};
