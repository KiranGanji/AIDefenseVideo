import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Simplified US outline — scaled to 780x480 viewbox
const US_PATH = "M 82,158 L 96,142 L 126,130 L 158,114 L 192,106 L 228,96 L 266,88 L 306,82 L 348,76 L 390,72 L 432,68 L 472,64 L 510,62 L 546,60 L 578,60 L 608,62 L 636,66 L 660,74 L 680,84 L 696,96 L 708,112 L 716,128 L 720,146 L 718,164 L 712,182 L 700,198 L 684,212 L 668,224 L 656,238 L 650,254 L 654,272 L 668,288 L 678,306 L 672,322 L 654,336 L 630,346 L 602,352 L 572,356 L 538,358 L 504,356 L 468,352 L 430,350 L 392,352 L 354,358 L 316,368 L 282,380 L 258,394 L 248,408 L 246,422 L 252,432 L 258,440 L 250,452 L 232,462 L 208,470 L 178,472 L 148,466 L 118,454 L 90,436 L 68,416 L 50,394 L 38,370 L 30,344 L 28,318 L 32,292 L 40,268 L 52,248 L 64,228 L 72,208 L 76,188 L 76,168 Z";

// 22 provider dots (x,y in the 780x480 viewbox)
const PROVIDER_DOTS = [
  { x:710,y:148 },{ x:672,y:188 },{ x:650,y:218 },{ x:618,y:242 },
  { x:586,y:268 },{ x:554,y:298 },{ x:524,y:316 },{ x:492,y:318 },
  { x:458,y:310 },{ x:424,y:296 },{ x:390,y:280 },{ x:356,y:272 },
  { x:320,y:268 },{ x:284,y:272 },{ x:252,y:292 },{ x:228,y:316 },
  { x:196,y:304 },{ x:168,y:280 },{ x:148,y:250 },{ x:128,y:222 },
  { x:120,y:190 },{ x:90,y:176 },
];

const NETWORK_EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],
  [10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],
  [0,3],[2,8],[5,12],[9,14],[13,18],[6,11],[3,9],
];

const TIMELINE_EVENTS = [0, 1.2, 2.5, 4.1, 5.8, 8.2, 11.0];

function fmt$(val) { return "$" + Math.round(val).toLocaleString(); }

export const Scene6ThirdPartyGraph = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  const labelOp  = interp(lf, [0, 20], [0, 1]);
  const mapOp    = interp(lf, [30, 78], [0, 1]);
  const dotCount  = Math.floor(interp(lf, [80, 245], [0, PROVIDER_DOTS.length]));
  const edgeProg  = interp(lf, [262, 385], [0, 1]);
  const webPulse  = 0.55 + Math.sin(lf * 0.06) * 0.28;

  const timelineOp = interp(lf, [410, 452], [0, 1]);
  const timelineEvents = TIMELINE_EVENTS.map((month, i) => ({
    month, op: clamp(interp(lf, [432 + i * 18, 450 + i * 18], [0, 1]), 0, 1),
  }));

  const barOp      = interp(lf, [562, 594], [0, 1]);
  const normalBarH  = interp(lf, [582, 640], [0, 110]);
  const flaggedBarH = interp(lf, [598, 672], [0, 320]);

  const statsOp   = interp(lf, [655, 695], [0, 1]);
  const counterVal = interp(lf, [702, 804], [0, 1100000]);
  const counterOp  = interp(lf, [698, 724], [0, 1]);

  // Map dimensions
  const MAP_W = 760, MAP_H = 490;

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs><pattern id="dg6" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
        </pattern></defs>
        <rect width="1920" height="1080" fill="url(#dg6)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 42, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 10, alignItems: "center",
          background: COLORS.tealLight, borderRadius: 100,
          padding: "8px 22px", border: `2px solid ${COLORS.teal}55`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.teal }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.teal }}>
            Third Party Graph
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 42, left: "50%",
        transform: "translateX(-50%)", opacity: labelOp, textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 48, fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5 }}>
          Spinal Injection Utilization Abuse Network
        </div>
      </div>

      {/* ── LEFT: US Map ── */}
      <div style={{ position: "absolute", left: 40, top: 130, width: MAP_W + 40, opacity: mapOp }}>
        <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ overflow: "visible" }}>
          {/* US outline */}
          <path d={US_PATH}
            fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.16)" strokeWidth={2} />

          {/* Network edges */}
          {NETWORK_EDGES.map(([a, b], i) => {
            const da = PROVIDER_DOTS[a], db = PROVIDER_DOTS[b];
            if (!da || !db) return null;
            const localP = clamp(edgeProg * NETWORK_EDGES.length - i * 0.9, 0, 1);
            const ex = da.x + (db.x - da.x) * localP;
            const ey = da.y + (db.y - da.y) * localP;
            return (
              <g key={i} opacity={clamp(0.5 * webPulse, 0, 1)}>
                <line x1={da.x} y1={da.y} x2={ex} y2={ey}
                  stroke={COLORS.red} strokeWidth={1.5} />
              </g>
            );
          })}

          {/* Provider dots */}
          {PROVIDER_DOTS.slice(0, dotCount).map((dot, i) => (
            <g key={i}>
              <circle cx={dot.x} cy={dot.y} r={11} fill={COLORS.red} opacity={0.88} />
              <circle cx={dot.x} cy={dot.y} r={20} fill={COLORS.red} opacity={0.16} />
            </g>
          ))}
        </svg>

        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 16,
          color: "rgba(0,0,0,0.35)", textAlign: "center", marginTop: 12,
          opacity: dotCount > 5 ? 1 : 0,
        }}>
          22 providers · 17 states · Pain medicine, anesthesiology, neurology
        </div>

        {/* Insight below map */}
        <div style={{
          marginTop: 24, opacity: clamp(edgeProg * 2, 0, 1),
          background: COLORS.redLight, border: `2px solid ${COLORS.red}44`,
          borderRadius: 12, padding: "14px 22px",
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.red }}>
            Not a billing error — a utilization abuse signal
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(0,0,0,0.45)", marginTop: 5 }}>
            Claims were largely paid with minimal denials
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ position: "absolute", left: 860, top: 120, width: 1000, bottom: 60 }}>

        {/* Member timeline */}
        <div style={{ opacity: timelineOp, marginBottom: 52 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22,
            fontWeight: 700, color: COLORS.textDark, marginBottom: 24,
          }}>
            Member-Level Pattern — Same Patient, Recurring Injections
          </div>

          <div style={{ position: "relative", height: 110 }}>
            {/* Base line */}
            <div style={{
              position: "absolute", top: 40, left: 0, right: 0, height: 2.5,
              background: "rgba(0,0,0,0.1)", borderRadius: 2,
            }} />
            {/* Month labels */}
            {[0, 2, 4, 6, 8, 10, 12].map(m => (
              <div key={m} style={{
                position: "absolute", left: (m / 12) * 100 + "%",
                bottom: 0, transform: "translateX(-50%)",
                fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(0,0,0,0.3)",
              }}>
                {m === 0 ? "Jan" : m === 6 ? "Jul" : m === 12 ? "Dec" : `M${m}`}
              </div>
            ))}
            {/* Injection events */}
            {timelineEvents.map(({ month, op }, i) => (
              <div key={i} style={{
                position: "absolute", left: (month / 12) * 100 + "%",
                top: 12, transform: "translateX(-50%)", opacity: op,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: COLORS.red, border: "3.5px solid white",
                  boxShadow: `0 3px 12px ${COLORS.red}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 14 }}>💉</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: COLORS.redLight, borderRadius: 10,
              padding: "10px 20px", border: `1.5px solid ${COLORS.red}44`,
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: COLORS.red }}>
                7 injections / year — 3× national norm
              </span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ opacity: barOp }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22,
            fontWeight: 700, color: COLORS.textDark, marginBottom: 28,
          }}>
            Annual Spinal Injections — Flagged vs. National Average
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 52, height: 360 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 150, height: normalBarH,
                background: "rgba(0,0,0,0.12)", borderRadius: "8px 8px 0 0",
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10,
              }}>
                {normalBarH > 28 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: "rgba(0,0,0,0.4)" }}>2</span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
                National<br />average / year
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 150, height: flaggedBarH,
                background: COLORS.red, borderRadius: "8px 8px 0 0",
                boxShadow: `0 6px 28px ${COLORS.red}44`,
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12,
              }}>
                {flaggedBarH > 50 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 40, fontWeight: 900, color: "#fff" }}>7</span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
                Flagged<br />members / year
              </div>
            </div>

            <div style={{
              paddingBottom: 24, opacity: flaggedBarH > 80 ? 1 : 0,
            }}>
              <div style={{
                background: COLORS.tealLight, border: `2px solid ${COLORS.teal}55`,
                borderRadius: 14, padding: "16px 24px",
              }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 900, color: COLORS.teal }}>3× national norm</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.45)", marginTop: 6, lineHeight: 1.5 }}>
                  Not a billing error —<br />a utilization abuse signal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 18, marginTop: 28, flexWrap: "wrap", opacity: statsOp }}>
          {[
            { val: "22",      label: "providers flagged",      bg: COLORS.redLight,  color: COLORS.red  },
            { val: "17",      label: "states",                  bg: "rgba(0,0,0,0.05)", color: COLORS.textMid },
            { val: "Minimal", label: "denials — largely paid",  bg: COLORS.tealLight, color: COLORS.teal },
          ].map(c => (
            <div key={c.label} style={{
              padding: "12px 24px", borderRadius: 10, background: c.bg,
              display: "flex", gap: 14, alignItems: "center",
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 900, color: c.color }}>{c.val}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dollar counter */}
      <div style={{
        position: "absolute", bottom: 60, right: 70,
        textAlign: "right", opacity: counterOp,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
          color: "rgba(0,0,0,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
        }}>Estimated Exposure</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 72, fontWeight: 900, color: COLORS.teal, letterSpacing: -1 }}>
          {fmt$(counterVal)}
        </div>
      </div>
    </div>
  );
};
