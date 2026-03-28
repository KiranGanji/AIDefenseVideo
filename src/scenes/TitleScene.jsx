import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const Word = ({ children, delay, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        color,
        opacity,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
        marginRight: "0.25em",
      }}
    >
      {children}
    </span>
  );
};

export const TitleScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(localFrame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(localFrame, [50, 90], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagOpacity = interpolate(localFrame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Animated ring behind title */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `1px solid ${COLORS.blue}20`,
          boxShadow: `0 0 80px ${COLORS.blue}10`,
          opacity: titleOpacity,
          transform: `scale(${interpolate(localFrame, [0, 60], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `1px solid ${COLORS.purple}30`,
          opacity: titleOpacity,
        }}
      />

      {/* Main title */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.1,
            color: "#fff",
          }}
        >
          <Word delay={5} color={COLORS.blue}>AI</Word>
          <Word delay={12} color={COLORS.purple}>Semantic</Word>
          <Word delay={19} color={COLORS.green}>Layer</Word>
          <br />
          <Word delay={26} color="#fff">Architecture</Word>
        </div>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.blue}, ${COLORS.purple}, transparent)`,
          borderRadius: 2,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 300,
            letterSpacing: 1,
          }}
        >
          Unifying Knowledge Across AI Teams
        </div>
      </div>

      {/* Tag pills */}
      <div
        style={{
          display: "flex",
          gap: 16,
          opacity: tagOpacity,
          marginTop: 8,
        }}
      >
        {["Shared Knowledge", "Agent Orchestration", "Scale Automation"].map((tag, i) => (
          <div
            key={tag}
            style={{
              padding: "8px 20px",
              borderRadius: 100,
              border: `1px solid rgba(255,255,255,0.15)`,
              background: "rgba(255,255,255,0.05)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: 0.5,
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};
