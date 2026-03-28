import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const MODULES = [
  { label: "Impact\nRadar",              amount: "$2,100,000", color: COLORS.green,  bg: COLORS.greenLight  },
  { label: "Adversarial Claim\nSimulator", amount: "$1,800,000", color: COLORS.amber,  bg: COLORS.amberLight  },
  { label: "Retro AI\nEditing",          amount: "$1,100,000", color: COLORS.purple, bg: COLORS.purpleLight },
  { label: "Third Party\nGraph",         amount: "$1,100,000", color: COLORS.teal,   bg: COLORS.tealLight   },
];

const TOTAL = 6100000;

function formatMoney(val) {
  return "$" + Math.round(val).toLocaleString();
}

const TAGLINES = ["Detect earlier.", "Reason deeper.", "Act faster."];

export const Scene7Closing = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  // Phase 1: Module tiles re-appear with amounts (white bg, frames 0-360)
  const showModules = lf < 600;
  const bgTransition = interp(lf, [540, 600], [0, 1]); // 0=white, 1=dark

  // Module card animations (stagger 60 frames each)
  const modules = MODULES.map((m, i) => {
    const sf = 30 + i * 60;
    const cardProg = spring({ frame: lf - sf, fps, config: { damping: 14, stiffness: 90, mass: 0.9 } });
    const cardOp = interp(lf, [sf, sf + 20], [0, 1]);
    // Amount counter ticks up shortly after card appears
    const amtVal = interp(lf, [sf + 40, sf + 120], [0, parseFloat(m.amount.replace(/[$,]/g, ""))]);
    const amtOp = interp(lf, [sf + 38, sf + 58], [0, 1]);
    // Glow pulse
    const glowPulse = 1 + Math.sin(lf * 0.06 + i * 0.8) * 0.12;
    return {
      ...m,
      prog: clamp(cardProg, 0, 1),
      op: clamp(cardOp, 0, 1),
      amtVal,
      amtOp: clamp(amtOp, 0, 1),
      glowPulse,
    };
  });

  // Central total counter (frame 320-440)
  const totalVal = interp(lf, [320, 440], [0, TOTAL]);
  const totalOp = interp(lf, [316, 340], [0, 1]);
  const totalPulse = spring({ frame: lf - 445, fps, config: { damping: 8, stiffness: 160, mass: 0.7 } });

  // Arc connections pulse (frame 280+)
  const arcOp = interp(lf, [280, 320], [0, 1]);
  const arcPulse = 0.5 + Math.sin(lf * 0.08) * 0.3;

  // Phase 2: dark background fade in (frame 560-640)
  // Phase 2: taglines appear one by one (frame 640-800)
  const tagOps = TAGLINES.map((_, i) => ({
    op: interp(lf, [640 + i * 80, 680 + i * 80], [0, 1]),
    slide: interp(lf, [640 + i * 80, 680 + i * 80], [20, 0]),
  }));

  // Brand / AI Defense logo (frame 870-940)
  const brandOp = interp(lf, [870, 930], [0, 1]);

  // Hub center for arc drawing
  const HUB_CX = 960, HUB_CY = 540;
  // Cards positioned in arc around center
  const CARD_W = 280, CARD_H = 180;
  const POSITIONS = [
    { x: 260, y: 200 },  // top-left
    { x: 660, y: 200 },  // top-right (adjusted for wider spacing)
    { x: 260, y: 560 },  // bottom-left
    { x: 660, y: 560 },  // bottom-right
  ];
  // Center these 4 cards: start x at (1920 - 2*280 - 80) / 2 = 540 offset...
  // Let me redo: 4 cards in a 2x2 grid centered at 960, 540
  // 2 cols, 2 rows, each 280x180, gap 80
  const COL_GAP = 80, ROW_GAP = 60;
  const GRID_W = 2 * CARD_W + COL_GAP; // 640
  const GRID_H = 2 * CARD_H + ROW_GAP; // 420
  const GRID_LEFT = (1920 - GRID_W) / 2 - 10; // 630
  const GRID_TOP = (1080 - GRID_H) / 2 - 80;   // 250

  const cardPositions = [
    { x: GRID_LEFT,                y: GRID_TOP },
    { x: GRID_LEFT + CARD_W + COL_GAP, y: GRID_TOP },
    { x: GRID_LEFT,                y: GRID_TOP + CARD_H + ROW_GAP },
    { x: GRID_LEFT + CARD_W + COL_GAP, y: GRID_TOP + CARD_H + ROW_GAP },
  ];

  // Center of each card
  const cardCenters = cardPositions.map(p => ({
    x: p.x + CARD_W / 2,
    y: p.y + CARD_H / 2,
  }));

  const bgColor = `rgb(${Math.round(255 * (1 - bgTransition))}, ${Math.round(255 * (1 - bgTransition))}, ${Math.round(255 * (1 - bgTransition) + 26 * bgTransition)})`;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: bgTransition < 0.5 ? COLORS.lightBg : COLORS.darkBg,
      overflow: "hidden", transition: "background 0.1s",
    }}>

      {/* === PHASE 1: White bg module tiles === */}
      {bgTransition < 0.98 && (
        <>
          {/* Dot grid */}
          <svg style={{ position: "absolute", inset: 0, opacity: 0.05 * (1 - bgTransition) }} width="1920" height="1080">
            <defs>
              <pattern id="dotg7" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.2" fill="#378ADD" />
              </pattern>
            </defs>
            <rect width="1920" height="1080" fill="url(#dotg7)" />
          </svg>

          {/* Title */}
          <div style={{
            position: "absolute", top: 54, left: "50%",
            transform: "translateX(-50%)",
            opacity: modules[0].op,
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              fontWeight: 600, letterSpacing: 3, textTransform: "uppercase",
              color: COLORS.blueDark, marginBottom: 6,
            }}>
              AI Defense · Portfolio Impact
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 38,
              fontWeight: 700, color: COLORS.textDark, letterSpacing: -0.5,
            }}>
              Combined Exposure Opportunity
            </div>
          </div>

          {/* Arc lines from center to cards */}
          <svg style={{ position: "absolute", inset: 0, opacity: arcOp * arcPulse, pointerEvents: "none" }}
            width="1920" height="1080">
            {cardCenters.map((cc, i) => {
              const color = MODULES[i].color;
              return (
                <line key={i}
                  x1={960} y1={540}
                  x2={cc.x} y2={cc.y}
                  stroke={color} strokeWidth={2}
                  strokeDasharray="8 5" strokeOpacity={0.5}
                />
              );
            })}
          </svg>

          {/* Module cards */}
          {modules.map((m, i) => {
            const pos = cardPositions[i];
            return (
              <div key={i} style={{
                position: "absolute",
                left: pos.x, top: pos.y,
                width: CARD_W, height: CARD_H,
                borderRadius: 16,
                background: m.bg,
                border: `2px solid ${m.color}55`,
                boxShadow: `0 4px ${20 * m.glowPulse}px ${m.color}33`,
                opacity: m.op,
                transform: `scale(${0.7 + m.prog * 0.3})`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "18px 20px",
              }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 16,
                  fontWeight: 700, color: COLORS.textDark,
                  textAlign: "center", whiteSpace: "pre-wrap",
                  marginBottom: 14, lineHeight: 1.3,
                }}>
                  {m.label}
                </div>
                <div style={{
                  opacity: m.amtOp,
                  fontFamily: "'Inter', sans-serif", fontSize: 26,
                  fontWeight: 800, color: m.color,
                  letterSpacing: -0.5,
                }}>
                  {formatMoney(m.amtVal)}
                </div>
                {/* Flow arrow toward center */}
                <div style={{
                  position: "absolute",
                  [i < 2 ? "bottom" : "top"]: -20,
                  left: "50%", transform: "translateX(-50%)",
                  opacity: m.amtOp * 0.5,
                }}>
                  <svg width="16" height="16">
                    <polygon
                      points={i < 2 ? "8,16 0,0 16,0" : "8,0 0,16 16,16"}
                      fill={m.color}
                    />
                  </svg>
                </div>
              </div>
            );
          })}

          {/* Central total */}
          <div style={{
            position: "absolute",
            left: "50%", top: "50%",
            transform: `translate(-50%, -50%) scale(${0.8 + clamp(totalPulse, 0, 1) * 0.2})`,
            textAlign: "center",
            opacity: totalOp,
          }}>
            <div style={{
              width: 200, height: 200, borderRadius: "50%",
              background: COLORS.blueDark,
              border: `3px solid ${COLORS.blue}`,
              boxShadow: `0 0 ${40 * (1 + Math.sin(lf * 0.07) * 0.2)}px ${COLORS.blue}55`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11,
                fontWeight: 700, color: "rgba(255,255,255,0.6)",
                letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6,
              }}>
                Total
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 22,
                fontWeight: 800, color: "#fff", letterSpacing: -0.5,
                lineHeight: 1.1,
              }}>
                {formatMoney(totalVal)}
                <span style={{ fontSize: 16 }}>+</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === PHASE 2: Dark bg taglines === */}
      {bgTransition > 0.02 && (
        <>
          {/* Dark ambient */}
          <div style={{
            position: "absolute", width: 800, height: 800, borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.blue}15 0%, transparent 70%)`,
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            opacity: bgTransition, pointerEvents: "none",
          }} />

          {/* Taglines */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 28, opacity: bgTransition,
          }}>
            {TAGLINES.map((line, i) => (
              <div key={i} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 72, fontWeight: 800,
                color: "#fff", letterSpacing: -1,
                opacity: tagOps[i].op,
                transform: `translateY(${tagOps[i].slide}px)`,
                textShadow: `0 0 60px ${COLORS.blue}44`,
              }}>
                {line}
              </div>
            ))}
          </div>

          {/* Brand lockup */}
          <div style={{
            position: "absolute", bottom: 80, left: "50%",
            transform: "translateX(-50%)",
            opacity: brandOp * bgTransition,
            textAlign: "center",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 100, padding: "12px 36px",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: COLORS.blue,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 14, height: 14, borderRadius: 2, background: "#fff", opacity: 0.9 }} />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 18,
                  fontWeight: 700, color: "#fff", letterSpacing: 0.5,
                }}>
                  AI Defense
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12,
                  color: "rgba(255,255,255,0.45)", letterSpacing: 1, marginTop: 2,
                }}>
                  Detect · Reason · Act
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
