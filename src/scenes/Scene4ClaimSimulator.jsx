import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const PROVIDERS = [
  { id: "Lab A", rate: 89, lines: "11,200" },
  { id: "Lab B", rate: 83, lines: "8,600" },
  { id: "Lab C", rate: 76, lines: "9,400" },
  { id: "Lab D", rate: 71, lines: "7,900" },
  { id: "Lab E", rate: 65, lines: "5,900" },
];

const SPLIT_ROWS = [
  { code: "Base lab code",            amount: "$84.00",  mod: "",          isBase: true  },
  { code: "Mod 59 — add-on panel A",  amount: "$47.00",  mod: "Mod 59",    isBase: false },
  { code: "XU — add-on panel B",      amount: "$63.00",  mod: "XU",        isBase: false },
  { code: "XS — separate procedure",  amount: "$41.00",  mod: "XS",        isBase: false },
  { code: "XE — distinct encounter",  amount: "$55.00",  mod: "XE",        isBase: false },
];

function fmt$(val) { return "$" + Math.round(val).toLocaleString(); }

export const Scene4ClaimSimulator = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  // ── Phase 1: Labels (0-20) ────────────────────────────────────────────────
  const labelOp = interp(lf, [0, 20], [0, 1]);

  // ── Phase 2: Provider bar chart (20-420 fully visible, then fade) ─────────
  // Bars stagger in 40-200. Peer line at 210. Callout visible ~265.
  // *** PAUSE 1: bar chart holds from ~270 until frame 420 (5 seconds) ***
  const barChartOp   = interp(lf, [20, 55], [0, 1]);
  const barChartFade = interp(lf, [420, 490], [1, 0]);   // fades after pause

  const providerBars = PROVIDERS.map((p, i) => {
    const sf    = 40 + i * 28;
    const prog  = spring({ frame: lf - sf, fps, config: { damping: 14, stiffness: 110, mass: 0.7 } });
    const barW  = clamp(prog, 0, 1) * (p.rate / 100);
    const rowOp = clamp(interp(lf, [sf, sf + 18], [0, 1]), 0, 1);
    return { ...p, barW, rowOp };
  });

  const peerLineOp = interp(lf, [210, 255], [0, 1]);

  // ── Phase 3: Gauge (420-660) ──────────────────────────────────────────────
  // Appears as bar chart fades out, needle sweeps, label holds
  const gaugeOp      = interp(lf, [420, 465], [0, 1]);
  const needleAngle  = interp(lf, [468, 618], [5, 155]);
  const needlePct    = Math.round(interp(lf, [468, 618], [5, 89]));
  const gaugeLabelOp = interp(lf, [615, 660], [0, 1]);

  // ── Phase 4: Bill rows (490-780) ──────────────────────────────────────────
  const billHeaderOp = interp(lf, [490, 525], [0, 1]);

  const splitRows = SPLIT_ROWS.map((r, i) => {
    const sf   = 510 + i * 30;
    const prog = spring({ frame: lf - sf, fps, config: { damping: 14, stiffness: 100, mass: 0.8 } });
    return { ...r, prog: clamp(prog, 0, 1), op: clamp(interp(lf, [sf, sf + 20], [0, 1]), 0, 1) };
  });

  const totalOp   = interp(lf, [665, 700], [0, 1]);
  const statsOp   = interp(lf, [695, 735], [0, 1]);
  const contextOp = interp(lf, [730, 775], [0, 1]);

  // ── Phase 5: Exposure counter — after 5-second pause (930-1010) ───────────
  // *** PAUSE 2: context fully visible ~775, hold until frame 930 (5 seconds) ***
  const counterVal = interp(lf, [935, 1005], [0, 1800000]);
  const counterOp  = interp(lf, [930, 955], [0, 1]);

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      {/* Dot grid */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs><pattern id="dg4" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
        </pattern></defs>
        <rect width="1920" height="1080" fill="url(#dg4)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 38, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 12, alignItems: "center",
          background: COLORS.amberLight, borderRadius: 100,
          padding: "14px 32px", border: `2.5px solid ${COLORS.amber}`,
          boxShadow: `0 4px 18px ${COLORS.amber}33`,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: COLORS.amber }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.amber, letterSpacing: 0.5 }}>
            Adversarial Claim Simulator
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 42, left: "50%",
        transform: "translateX(-50%)", opacity: labelOp, textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 48, fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5 }}>
          Modifier Unbundling Detection
        </div>
      </div>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", left: 60, top: 120, width: 880, bottom: 60 }}>

        {/* Phase 1+2: Provider bar chart — fades out when bill rows come in */}
        <div style={{ opacity: barChartOp * barChartFade }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
            color: "rgba(0,0,0,0.65)", letterSpacing: 1.4, textTransform: "uppercase",
            marginBottom: 24, marginTop: 12,
          }}>
            Modifier 59 & X Series usage rate by Provider
          </div>

          {providerBars.map((row) => (
            <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26, opacity: row.rowOp }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700,
                color: "rgba(0,0,0,0.72)", width: 60, flexShrink: 0,
              }}>{row.id}</div>

              <div style={{ flex: 1, position: "relative" }}>
                {/* Background track */}
                <div style={{ height: 32, background: "rgba(0,0,0,0.06)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${row.barW * 100}%`, height: "100%",
                    background: COLORS.red, borderRadius: 8, opacity: 0.82,
                    transition: "width 0.1s",
                  }} />
                </div>
                {/* Peer median line at 5% */}
                <div style={{
                  position: "absolute", left: "5%", top: -6, bottom: -6,
                  width: 2.5, background: COLORS.green, borderRadius: 2,
                  opacity: peerLineOp,
                }} />
              </div>

              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 900,
                color: COLORS.red, width: 56, textAlign: "right", flexShrink: 0,
              }}>{row.rate}%</div>

              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 15,
                color: "rgba(0,0,0,0.52)", width: 90, textAlign: "right", flexShrink: 0,
              }}>{row.lines} lines</div>
            </div>
          ))}

          {/* Peer median annotation */}
          <div style={{
            marginTop: 8, opacity: peerLineOp,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 24, height: 3, background: COLORS.green, borderRadius: 2 }} />
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600,
              color: COLORS.green,
            }}>
              Peer median: &lt;5%
            </span>
          </div>

          {/* 99th percentile callout */}
          <div style={{
            marginTop: 28,
            opacity: clamp(peerLineOp * 2 - 0.5, 0, 1),
            background: COLORS.redLight, border: `2px solid ${COLORS.red}44`,
            borderRadius: 14, padding: "16px 28px",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.red }}>
              All 5 providers exceed the 99th percentile
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(0,0,0,0.60)", marginTop: 6 }}>
              Same date · Same patient · Same encounter
            </div>
          </div>
        </div>

        {/* Phase 4: Bill rows — slide in after bar chart fades */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          opacity: billHeaderOp,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 600,
            color: "rgba(0,0,0,0.65)", marginBottom: 18, marginTop: 12, letterSpacing: 0.2,
          }}>
            1 claim → 5 reimbursement lines
          </div>

          {splitRows.map((r, i) => (
            <div key={i} style={{
              opacity: r.op, transform: `translateX(${(1 - r.prog) * -38}px)`,
              marginBottom: 14,
            }}>
              <div style={{
                background: r.isBase ? "#F8F9FA" : COLORS.redLight,
                border: `2px solid ${r.isBase ? "rgba(0,0,0,0.09)" : COLORS.red + "44"}`,
                borderRadius: 12, padding: "16px 26px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {!r.isBase && (
                    <div style={{
                      background: COLORS.amberLight, border: `1.5px solid ${COLORS.amber}66`,
                      borderRadius: 6, padding: "4px 10px",
                      fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800, color: COLORS.amber,
                      flexShrink: 0,
                    }}>{r.mod}</div>
                  )}
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 20,
                    fontWeight: r.isBase ? 700 : 500,
                    color: r.isBase ? COLORS.textDark : COLORS.red,
                  }}>{r.code}</div>
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 24,
                  fontWeight: 800, color: r.isBase ? COLORS.textDark : COLORS.red,
                }}>{r.amount}</div>
              </div>
            </div>
          ))}

          {/* Total */}
          <div style={{
            opacity: totalOp, marginTop: 8,
            borderTop: `2.5px solid ${COLORS.red}55`, paddingTop: 16,
            display: "flex", justifyContent: "flex-end",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 900, color: COLORS.red }}>
              Total: $290.00 <span style={{ fontWeight: 400, fontSize: 18 }}>(vs $84 base)</span>
            </div>
          </div>

          {/* Stats chips */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 28, opacity: statsOp }}>
            {[
              { val: "43,000",    label: "claim lines",   bg: "rgba(0,0,0,0.05)", color: COLORS.textMid },
              { val: "5",         label: "lab providers", bg: COLORS.redLight,    color: COLORS.red     },
              { val: "99th %ile", label: "all exceed",    bg: COLORS.amberLight,  color: COLORS.amber   },
            ].map(c => (
              <div key={c.label} style={{
                padding: "12px 22px", borderRadius: 12, background: c.bg,
                display: "flex", gap: 12, alignItems: "center",
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 900, color: c.color }}>{c.val}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(0,0,0,0.60)" }}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* Context text */}
          <div style={{ marginTop: 28, opacity: contextOp }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 22,
              color: "rgba(0,0,0,0.65)", lineHeight: 1.65,
            }}>
              Base lab codes paired with modifier-separated add-on lines — same date, same patient, same encounter.
              This is not random variation. It is systematic unbundling designed to maximize reimbursement.
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Gauge ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: 1010, top: 120, width: 850,
        opacity: gaugeOp, paddingTop: 20,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 24,
          fontWeight: 700, color: COLORS.textDark, marginBottom: 20, textAlign: "center",
        }}>
          Modifier Usage Rate vs. Peer Median
        </div>

        {/* Gauge — 65% green / 35% red split */}
        {/* Split point at 65% of semicircle: (453, 139) */}
        <div style={{ display: "flex", justifyContent: "center", transform: "scale(0.82)", transformOrigin: "top center", marginBottom: -72 }}>
          <svg width={660} height={420} viewBox="0 0 660 420">
            {/* Green arc: 0–65% (normal zone, <65%) */}
            <path d="M 60 380 A 270 270 0 0 1 453 139"
              fill="none" stroke={COLORS.green} strokeWidth={56} strokeLinecap="round" opacity={0.55} />
            {/* Red arc: 65–100% (danger zone) */}
            <path d="M 453 139 A 270 270 0 0 1 600 380"
              fill="none" stroke={COLORS.red} strokeWidth={56} strokeLinecap="round" opacity={0.70} />

            <text x="106" y="324" fontFamily="Inter,sans-serif" fontSize="22" fontWeight="700" fill="rgba(0,0,0,0.70)" textAnchor="middle">Normal</text>
            <text x="106" y="350" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="600" fill="rgba(0,0,0,0.60)" textAnchor="middle">&lt;5%</text>
            <text x="554" y="324" fontFamily="Inter,sans-serif" fontSize="22" fontWeight="700" fill={COLORS.red} textAnchor="middle">Danger</text>
            <text x="554" y="350" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="600" fill={COLORS.red} textAnchor="middle">65–89%</text>

            {/* Needle */}
            <g transform={`rotate(${needleAngle - 90}, 330, 380)`}>
              <line x1={330} y1={380} x2={330} y2={134}
                stroke={COLORS.red} strokeWidth={5.5} strokeLinecap="round" />
              <circle cx={330} cy={380} r={15} fill={COLORS.red} />
            </g>

            {/* Live percentage */}
            <text x="330" y="330"
              fontFamily="Inter,sans-serif" fontSize="60" fontWeight="bold"
              fill={COLORS.red} textAnchor="middle">
              {needlePct}%
            </text>
          </svg>
        </div>

        {/* Callout below gauge */}
        <div style={{ opacity: gaugeLabelOp, textAlign: "center", marginTop: 20 }}>
          <div style={{
            display: "inline-block",
            background: COLORS.redLight, border: `2px solid ${COLORS.red}55`,
            borderRadius: 14, padding: "18px 36px",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.red }}>
              All 5 providers exceed the 99th percentile
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(0,0,0,0.65)", marginTop: 6 }}>
              65–89% modifier rate vs. peer median &lt;5%
            </div>
          </div>
        </div>

        {/* Exposure counter */}
        <div style={{ marginTop: 48, paddingLeft: 24, textAlign: "center", opacity: counterOp }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
            color: "rgba(0,0,0,0.65)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
          }}>
            Estimated Exposure
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 80, fontWeight: 900, color: COLORS.amber, letterSpacing: -1 }}>
            {fmt$(counterVal)}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(0,0,0,0.55)", marginTop: 4 }}>
            across 43,000 claim lines
          </div>
        </div>
      </div>
    </div>
  );
};
