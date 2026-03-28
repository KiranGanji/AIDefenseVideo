import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const PILLARS = [
  { label: "Policy & Benefit\nIntelligence", color: COLORS.blue,   bg: COLORS.blueLight  },
  { label: "Claims\nIntelligence",            color: COLORS.red,    bg: COLORS.redLight   },
  { label: "Network\nIntelligence",           color: COLORS.teal,   bg: COLORS.tealLight  },
  { label: "Clinical\nIntelligence",          color: COLORS.green,  bg: COLORS.greenLight },
];

const KEYWORDS = ["Modular", "Auditable", "Secure"];

// Layout constants
const CARD_W = 310, CARD_H = 190;
const GAP = 52;
const TOTAL_W = 4 * CARD_W + 3 * GAP; // 1388
const START_X = (1920 - TOTAL_W) / 2;  // 266
const CARD_Y = 620;
const HUB_CX = 960, HUB_CY = 370, HUB_R = 100;

const cardCenterX = (i) => START_X + i * (CARD_W + GAP) + CARD_W / 2;

export const Scene2Architecture = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  const headerOp = interp(lf, [0, 25], [0, 1]);
  const descOp   = interp(lf, [30, 65], [0, 1]);

  const pillars = PILLARS.map((p, i) => {
    const sf = 40 + i * 18;
    const prog = spring({ frame: lf - sf, fps, config: { damping: 16, stiffness: 110, mass: 0.8 } });
    const op   = interp(lf, [sf, sf + 14], [0, 1]);
    return { ...p, prog: clamp(prog, 0, 1), op: clamp(op, 0, 1) };
  });

  const hubProg = spring({ frame: lf - 130, fps, config: { damping: 14, stiffness: 100, mass: 0.9 } });
  const hubOp   = interp(lf, [130, 158], [0, 1]);
  const arcProgress = interp(lf, [165, 240], [0, 1]);
  const hubGlow = 1 + Math.sin(lf * 0.07) * 0.18;

  const kwOp  = interp(lf, [255, 295], [0, 1]);
  const expOp = interp(lf, [320, 370], [0, 1]);

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      {/* Dot grid */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.06 }} width="1920" height="1080">
        <defs>
          <pattern id="dotg2" width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#dotg2)" />
      </svg>

      {/* Header */}
      <div style={{
        position: "absolute", top: 52, left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center", opacity: headerOp,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 15,
          fontWeight: 700, letterSpacing: 4, textTransform: "uppercase",
          color: COLORS.blueDark, marginBottom: 10,
        }}>AI Defense</div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 56,
          fontWeight: 800, color: COLORS.blueDark, letterSpacing: -1,
        }}>A Modular Defense Architecture</div>
      </div>

      {/* Description */}
      <div style={{
        position: "absolute", top: 195, left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center", opacity: descOp, width: 900,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 24,
          color: "rgba(0,0,0,0.45)", lineHeight: 1.6,
        }}>
          Built across four intelligences — connected through Agentic Orchestration<br />
          for secure, auditable execution.
        </div>
      </div>

      {/* Arc lines from hub to cards */}
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="1920" height="1080">
        {[0, 1, 2, 3].map(i => {
          const cx = cardCenterX(i);
          const cardTopY = CARD_Y;
          const localProg = clamp(arcProgress * 4 - i * 0.8, 0, 1);
          const tx = HUB_CX + (cx - HUB_CX) * localProg;
          const ty = (HUB_CY + HUB_R) + (cardTopY - HUB_CY - HUB_R) * localProg;
          const color = PILLARS[i].color;
          return (
            <g key={i} opacity={clamp(hubOp, 0, 1)}>
              <line
                x1={HUB_CX} y1={HUB_CY + HUB_R}
                x2={tx} y2={ty}
                stroke={color} strokeWidth={2.5} strokeDasharray="8 5"
                strokeOpacity={0.65}
              />
              <circle cx={tx} cy={ty} r={5} fill={color} opacity={localProg < 1 ? 1 : 0} />
            </g>
          );
        })}
      </svg>

      {/* Hub */}
      <div style={{
        position: "absolute",
        left: HUB_CX - HUB_R, top: HUB_CY - HUB_R,
        width: HUB_R * 2, height: HUB_R * 2,
        borderRadius: "50%",
        background: COLORS.blueDark,
        border: `3.5px solid ${COLORS.blue}`,
        boxShadow: `0 0 ${44 * hubGlow}px ${COLORS.blue}55, 0 10px 40px rgba(0,0,0,0.2)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: clamp(hubOp, 0, 1),
        transform: `scale(${clamp(hubProg, 0, 1)})`,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            fontWeight: 800, color: "#fff", letterSpacing: 1.5,
            textTransform: "uppercase", lineHeight: 1.4,
          }}>
            Agentic<br />Orchestration
          </div>
        </div>
      </div>

      {/* Pillar cards */}
      {pillars.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: START_X + i * (CARD_W + GAP),
          top: CARD_Y,
          width: CARD_W, height: CARD_H,
          borderRadius: 16,
          background: p.bg,
          border: `2.5px solid ${p.color}55`,
          boxShadow: `0 6px 32px ${p.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p.op,
          transform: `translateY(${(1 - p.prog) * 90}px)`,
        }}>
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: p.color, margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: "white", opacity: 0.9 }} />
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 20,
              fontWeight: 700, color: COLORS.textDark,
              lineHeight: 1.35, whiteSpace: "pre-wrap",
            }}>
              {p.label}
            </div>
          </div>
        </div>
      ))}

      {/* Keywords */}
      <div style={{
        position: "absolute",
        top: CARD_Y + CARD_H + 52,
        left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 40, opacity: kwOp,
      }}>
        {KEYWORDS.map((kw, i) => (
          <div key={kw} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 26,
            fontWeight: 500, color: "rgba(0,0,0,0.32)", letterSpacing: 2,
          }}>
            {kw}{i < KEYWORDS.length - 1 ? " ·" : ""}
          </div>
        ))}
      </div>

      {/* Exposure callout */}
      <div style={{
        position: "absolute",
        top: CARD_Y + CARD_H + 130,
        left: "50%", transform: "translateX(-50%)",
        opacity: expOp, textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 14,
          background: COLORS.greenLight, borderRadius: 100,
          padding: "14px 36px",
          border: `2px solid ${COLORS.green}44`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.green }} />
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22,
            fontWeight: 700, color: COLORS.green,
          }}>
            $20M+ combined exposure opportunity identified across portfolio
          </span>
        </div>
      </div>
    </div>
  );
};
