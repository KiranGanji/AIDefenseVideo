import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const SolutionIntroScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  const bgScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 60, mass: 2 },
  });

  const titleOpacity = interpolate(localFrame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringScale = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.5 },
  });

  const descOpacity = interpolate(localFrame, [80, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pillsOpacity = interpolate(localFrame, [110, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const PILLARS = [
    { label: "Unified Metrics", icon: "📐", color: COLORS.blue },
    { label: "Shared Entities", icon: "🔗", color: COLORS.purple },
    { label: "Business Logic", icon: "⚙️", color: COLORS.green },
    { label: "Access Control", icon: "🛡️", color: COLORS.orange },
    { label: "Versioning", icon: "📦", color: COLORS.pink },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(123,79,255,0.18) 0%, rgba(0,212,255,0.08) 40%, transparent 70%)`,
          transform: `scale(${bgScale})`,
        }}
      />

      {/* Rings */}
      {[320, 240, 160].map((r, i) => (
        <div
          key={r}
          style={{
            position: "absolute",
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            border: `1px solid rgba(123,79,255,${0.1 + i * 0.08})`,
            transform: `scale(${Math.min(1, (ringScale * 3) / (3 - i))})`,
          }}
        />
      ))}

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: "center",
          zIndex: 10,
          transform: `translateY(${interpolate(localFrame, [20, 50], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.green,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          The Solution
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -2,
            background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.purple}, ${COLORS.green})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
          }}
        >
          The Semantic Layer
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          opacity: descOpacity,
          maxWidth: 700,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          A centralized, organization-wide knowledge plane that gives every AI agent
          a consistent, governed view of your data, business logic, and metrics.
        </p>
      </div>

      {/* Pillars */}
      <div
        style={{
          display: "flex",
          gap: 14,
          opacity: pillsOpacity,
          zIndex: 10,
          marginTop: 8,
        }}
      >
        {PILLARS.map((p, i) => (
          <div
            key={p.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 12,
              background: `${p.color}10`,
              border: `1px solid ${p.color}40`,
              opacity: interpolate(localFrame, [120 + i * 8, 140 + i * 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${interpolate(localFrame, [120 + i * 8, 140 + i * 8], [15, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px)`,
            }}
          >
            <span style={{ fontSize: 16 }}>{p.icon}</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: p.color,
              }}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
