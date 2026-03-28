import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export const Background = () => {
  const frame = useCurrentFrame();

  // Slowly shifting gradient
  const hue1 = (frame * 0.05) % 360;
  const hue2 = (frame * 0.03 + 120) % 360;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.bg,
        overflow: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(123,79,255,0.12) 0%, transparent 70%)`,
          top: -200,
          left: -200,
          transform: `translate(${Math.sin(frame * 0.008) * 30}px, ${Math.cos(frame * 0.006) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)`,
          bottom: -150,
          right: -100,
          transform: `translate(${Math.cos(frame * 0.007) * 25}px, ${Math.sin(frame * 0.009) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,255,148,0.06) 0%, transparent 70%)`,
          top: "40%",
          right: "20%",
          transform: `translate(${Math.sin(frame * 0.01) * 20}px, ${Math.cos(frame * 0.008) * 15}px)`,
        }}
      />

      {/* Grid overlay */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.04 }}
        width="1920"
        height="1080"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
      </svg>
    </div>
  );
};
