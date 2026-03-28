import { COLORS } from "../theme";

export const GlowNode = ({ x, y, color = COLORS.blue, size = 80, label, sublabel, icon, opacity = 1, scale = 1 }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x - (size * scale) / 2,
        top: y - (size * scale) / 2,
        width: size * scale,
        height: size * scale,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        }}
      />
      {/* Node circle */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${color}30, ${color}10)`,
          border: `2px solid ${color}60`,
          boxShadow: `0 0 30px ${color}40, 0 0 60px ${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
        }}
      >
        {icon}
      </div>
      {/* Labels */}
      {(label || sublabel) && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          {label && (
            <div
              style={{
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 0.3,
                textShadow: `0 0 20px ${color}80`,
              }}
            >
              {label}
            </div>
          )}
          {sublabel && (
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
