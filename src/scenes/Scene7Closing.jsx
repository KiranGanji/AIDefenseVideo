import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const TAGLINES = ["Detect earlier.", "Reason deeper.", "Act faster."];

export const Scene7Closing = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const lf = frame - startFrame;

  // AI Defense brand appears first at the top (frames 0-40)
  const brandOp    = interp(lf, [0, 35], [0, 1]);
  const brandSlide = interp(lf, [0, 35], [-20, 0]);

  // Taglines start after brand is settled, stagger every 55 frames
  const tagOps = TAGLINES.map((_, i) => ({
    op:    interp(lf, [80 + i * 55, 115 + i * 55], [0, 1]),
    slide: interp(lf, [80 + i * 55, 115 + i * 55], [24, 0]),
  }));

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.darkBg, overflow: "hidden" }}>

      {/* Ambient blue radial glow */}
      <div style={{
        position: "absolute", width: 960, height: 960, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.blue}1A 0%, transparent 70%)`,
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* AI Defense — large, top of screen, appears first */}
      <div style={{
        position: "absolute", top: 80, left: "50%",
        transform: `translateX(-50%) translateY(${brandSlide}px)`,
        opacity: brandOp,
        textAlign: "center",
        width: "100%",
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 52, fontWeight: 900,
          color: "#fff", letterSpacing: 2,
          textTransform: "uppercase",
          textShadow: `0 0 80px ${COLORS.blue}66`,
        }}>
          AI Defense
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 18, fontWeight: 400,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: 4, marginTop: 10,
          textTransform: "uppercase",
        }}>
          Detect · Reason · Act
        </div>
      </div>

      {/* Taglines — centered, appear after brand */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24,
      }}>
        {TAGLINES.map((line, i) => (
          <div key={i} style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 72, fontWeight: 800,
            color: "#fff", letterSpacing: -1,
            opacity: tagOps[i].op,
            transform: `translateY(${tagOps[i].slide}px)`,
            textShadow: `0 0 64px ${COLORS.blue}44`,
          }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
