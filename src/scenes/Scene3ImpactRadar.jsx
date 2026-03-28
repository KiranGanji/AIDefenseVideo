import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const PEER_DOTS = [
  [0.18,0.52],[0.22,0.60],[0.28,0.55],[0.32,0.62],[0.38,0.57],[0.42,0.64],[0.46,0.59],[0.50,0.66],
  [0.16,0.63],[0.24,0.69],[0.30,0.74],[0.36,0.71],[0.40,0.78],[0.44,0.73],[0.48,0.80],[0.52,0.75],
  [0.20,0.46],[0.26,0.50],[0.34,0.48],[0.38,0.52],[0.44,0.49],[0.48,0.54],[0.54,0.51],[0.58,0.56],
  [0.60,0.62],[0.64,0.58],[0.68,0.65],[0.72,0.60],[0.62,0.70],[0.66,0.76],[0.70,0.72],[0.74,0.68],
  [0.56,0.44],[0.60,0.50],[0.64,0.46],[0.68,0.52],[0.72,0.48],[0.76,0.54],[0.80,0.50],[0.78,0.58],
  [0.12,0.58],[0.14,0.70],[0.18,0.76],[0.22,0.80],[0.26,0.82],[0.30,0.84],[0.34,0.80],[0.38,0.86],
  [0.42,0.84],[0.46,0.88],[0.50,0.82],[0.54,0.85],[0.58,0.80],[0.62,0.82],[0.66,0.84],[0.70,0.80],
  [0.74,0.76],[0.78,0.74],[0.82,0.70],[0.84,0.64],[0.86,0.58],[0.88,0.52],[0.84,0.46],[0.82,0.40],
  [0.78,0.44],[0.76,0.38],[0.72,0.42],[0.68,0.38],[0.64,0.40],[0.60,0.36],[0.56,0.38],[0.52,0.42],
  [0.48,0.40],[0.44,0.44],[0.40,0.42],[0.36,0.46],[0.32,0.44],[0.28,0.48],[0.24,0.44],[0.20,0.48],
];

const OUTLIERS_FINAL = [
  [0.25,0.18],[0.30,0.13],[0.35,0.20],[0.40,0.10],[0.45,0.15],
  [0.50,0.08],[0.55,0.14],[0.60,0.10],[0.65,0.17],
];
const OUTLIERS_START = [
  [0.25,0.55],[0.30,0.62],[0.35,0.58],[0.40,0.64],[0.45,0.60],
  [0.50,0.66],[0.55,0.62],[0.60,0.65],[0.65,0.61],
];

// Plot occupies the full left half
const PLOT_LEFT = 60, PLOT_TOP = 115, PLOT_W = 840, PLOT_H = 800;
// Right panel
const RIGHT_X = 980, RIGHT_W = 900;

function fmt$(val) { return "$" + Math.round(val).toLocaleString(); }

export const Scene3ImpactRadar = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  const labelOp  = interp(lf, [0, 20], [0, 1]);
  const peerCount = Math.floor(interp(lf, [30, 180], [0, PEER_DOTS.length]));

  const outlierProg = spring({ frame: lf - 200, fps, config: { damping: 12, stiffness: 60, mass: 1 } });
  const outlierOp   = interp(lf, [200, 230], [0, 1]);

  const calloutOp    = interp(lf, [330, 380], [0, 1]);
  const calloutSlide = interp(lf, [330, 380], [-20, 0]);

  const erOp      = interp(lf, [420, 460], [0, 1]);
  const arrowProg = interp(lf, [455, 515], [0, 1]);
  const bedOp     = interp(lf, [490, 530], [0, 1]);

  const barOp     = interp(lf, [540, 570], [0, 1]);
  const expectedH = interp(lf, [560, 620], [0, 165]);
  const actualH   = interp(lf, [580, 660], [0, 470]);

  const counterVal = interp(lf, [700, 820], [0, 2100000]);
  const statsOp    = interp(lf, [655, 695], [0, 1]);

  const SVG_H = PLOT_H - 36;

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs><pattern id="dg3" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
        </pattern></defs>
        <rect width="1920" height="1080" fill="url(#dg3)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 42, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 10, alignItems: "center",
          background: COLORS.greenLight, borderRadius: 100,
          padding: "8px 22px", border: `2px solid ${COLORS.green}55`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.green }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.green }}>
            Impact Radar
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 42, left: "50%",
        transform: "translateX(-50%)", opacity: labelOp, textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 48, fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5 }}>
          ER-to-Inpatient Conversion Anomaly
        </div>
      </div>

      {/* ── SCATTER PLOT (left) ── */}
      <div style={{ position: "absolute", left: PLOT_LEFT, top: PLOT_TOP, width: PLOT_W, height: PLOT_H }}>
        <div style={{
          position: "absolute", bottom: 0, left: 40, right: 0,
          fontFamily: "'Inter', sans-serif", fontSize: 16,
          color: "rgba(0,0,0,0.35)", textAlign: "center",
        }}>Provider Cohort (Peer-Matched)</div>

        <div style={{
          position: "absolute", top: "50%", left: -52,
          transform: "translateY(-50%) rotate(-90deg)",
          fontFamily: "'Inter', sans-serif", fontSize: 16,
          color: "rgba(0,0,0,0.35)", whiteSpace: "nowrap",
        }}>ER→Inpatient Conversion Rate</div>

        <svg width={PLOT_W} height={SVG_H} style={{ overflow: "visible" }}>
          {[0.25, 0.5, 0.75].map(v => (
            <line key={v} x1={40} y1={v * SVG_H} x2={PLOT_W} y2={v * SVG_H}
              stroke="rgba(0,0,0,0.07)" strokeWidth={1} strokeDasharray="5 4" />
          ))}

          {/* Peer cluster band */}
          {peerCount > 20 && (
            <rect x={40} y={0.38 * SVG_H} width={PLOT_W - 40} height={0.52 * SVG_H}
              fill="rgba(0,0,0,0.025)" rx={10}
              stroke="rgba(0,0,0,0.07)" strokeWidth={1} strokeDasharray="6 4" />
          )}

          {/* Peer dots */}
          {PEER_DOTS.slice(0, peerCount).map(([rx, ry], i) => (
            <circle key={i}
              cx={40 + rx * (PLOT_W - 40)} cy={ry * SVG_H}
              r={6} fill="rgba(0,0,0,0.14)" />
          ))}

          {/* Outlier red dots */}
          {OUTLIERS_FINAL.map(([fx, fy], i) => {
            const [sx, sy] = OUTLIERS_START[i];
            const p = clamp(outlierProg, 0, 1);
            const cx = 40 + (sx + (fx - sx) * p) * (PLOT_W - 40);
            const cy = (sy + (fy - sy) * p) * SVG_H;
            return (
              <g key={i} opacity={clamp(outlierOp, 0, 1)}>
                <circle cx={cx} cy={cy} r={12} fill={COLORS.red} opacity={0.85} />
                <circle cx={cx} cy={cy} r={22} fill={COLORS.red} opacity={0.16} />
              </g>
            );
          })}
        </svg>

        {/* Callout */}
        <div style={{
          position: "absolute",
          left: PLOT_W * 0.28, top: SVG_H * 0.01,
          opacity: calloutOp, transform: `translateX(${calloutSlide}px)`,
        }}>
          <div style={{
            background: COLORS.redLight, borderRadius: 12,
            border: `2px solid ${COLORS.red}55`, padding: "14px 22px",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: COLORS.red }}>3.5× – 6×</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.5)", marginTop: 2 }}>above peer cohort</div>
          </div>
          <svg width="30" height="32" style={{ position: "absolute", bottom: -30, left: 28 }}>
            <line x1="15" y1="0" x2="15" y2="26" stroke={COLORS.red} strokeWidth="2.5" />
            <polygon points="8,20 15,30 22,20" fill={COLORS.red} />
          </svg>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ position: "absolute", left: RIGHT_X, top: PLOT_TOP, width: RIGHT_W, bottom: 60 }}>

        {/* ER → Inpatient */}
        <div style={{ opacity: erOp, display: "flex", alignItems: "center", gap: 28, marginBottom: 52 }}>
          <div style={{
            width: 120, height: 120, borderRadius: 20,
            background: COLORS.redLight, border: `2.5px solid ${COLORS.red}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 900, color: COLORS.red }}>ER</span>
          </div>

          <svg width={80 + arrowProg * 60} height="32">
            <line x1={0} y1={16} x2={64 + arrowProg * 60} y2={16} stroke={COLORS.red} strokeWidth={3.5} />
            <polygon points={`${64 + arrowProg * 60},8 ${84 + arrowProg * 60},16 ${64 + arrowProg * 60},24`} fill={COLORS.red} />
          </svg>

          <div style={{
            opacity: bedOp,
            width: 120, height: 120, borderRadius: 20,
            background: COLORS.redLight, border: `2.5px solid ${COLORS.red}66`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="58" height="44">
              <rect x="4" y="26" width="50" height="13" rx="3" fill={COLORS.red} opacity={0.8} />
              <rect x="4" y="18" width="26" height="10" rx="3" fill={COLORS.red} opacity={0.6} />
              <circle cx="40" cy="14" r="8" fill={COLORS.red} opacity={0.7} />
            </svg>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: COLORS.red, marginTop: 2 }}>INPATIENT</div>
          </div>

          <div style={{
            opacity: bedOp,
            fontFamily: "'Inter', sans-serif", fontSize: 18,
            color: "rgba(0,0,0,0.45)", lineHeight: 1.5, maxWidth: 260,
          }}>
            ER visits systematically converted to inpatient stays at rates patient severity alone cannot explain.
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ opacity: barOp }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22,
            fontWeight: 700, color: COLORS.textDark, marginBottom: 28,
          }}>Admission Rate vs. Expected (by Severity)</div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 48, height: 510 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 140, height: expectedH,
                background: "rgba(0,0,0,0.12)", borderRadius: "8px 8px 0 0",
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10,
              }}>
                {expectedH > 24 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: "rgba(0,0,0,0.4)" }}>~12%</span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
                Expected<br />admission rate
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 140, height: actualH,
                background: COLORS.red, borderRadius: "8px 8px 0 0",
                boxShadow: `0 6px 28px ${COLORS.red}44`,
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12,
              }}>
                {actualH > 40 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 900, color: "#fff" }}>94%</span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
                Actual<br />(top flagged)
              </div>
            </div>

            {/* Insight label next to bars */}
            <div style={{
              paddingBottom: 44, opacity: actualH > 80 ? 1 : 0,
            }}>
              <div style={{
                background: COLORS.redLight, border: `2px solid ${COLORS.red}44`,
                borderRadius: 12, padding: "14px 22px", maxWidth: 320,
              }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: COLORS.red }}>
                  94% of allowed spend — inpatient
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(0,0,0,0.45)", marginTop: 6 }}>
                  Most stays only 1–3 days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 18, marginTop: 36, flexWrap: "wrap", opacity: statsOp }}>
          {[
            { val: "68,000", label: "claims analyzed", bg: "rgba(0,0,0,0.05)", color: COLORS.textMid },
            { val: "9",      label: "billing entities flagged", bg: COLORS.redLight, color: COLORS.red },
          ].map(c => (
            <div key={c.label} style={{
              padding: "12px 24px", borderRadius: 10, background: c.bg,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 800, color: c.color }}>{c.val}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight callout below scatter plot */}
      <div style={{
        position: "absolute",
        left: PLOT_LEFT, top: PLOT_TOP + PLOT_H + 16,
        width: PLOT_W,
        opacity: calloutOp,
      }}>
        <div style={{
          background: COLORS.redLight, border: `2px solid ${COLORS.red}44`,
          borderRadius: 12, padding: "16px 24px",
          fontFamily: "'Inter', sans-serif",
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.red }}>9 billing entities</span>
          <span style={{ fontSize: 18, color: "rgba(0,0,0,0.5)", marginLeft: 10 }}>
            systematically converting ER visits into inpatient admissions at rates patient severity alone cannot explain
          </span>
        </div>
      </div>

      {/* Dollar counter */}
      <div style={{
        position: "absolute", bottom: 60, right: 70,
        textAlign: "right", opacity: interp(lf, [695, 720], [0, 1]),
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
          color: "rgba(0,0,0,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
        }}>Estimated Exposure</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 72, fontWeight: 900, color: COLORS.green, letterSpacing: -1 }}>
          {fmt$(counterVal)}
        </div>
      </div>
    </div>
  );
};
