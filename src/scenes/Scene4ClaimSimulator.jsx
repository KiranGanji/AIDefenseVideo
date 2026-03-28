import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const MODIFIERS = ["Mod 59", "XU", "XS", "XE"];

const SPLIT_ROWS = [
  { code: "Lab test: base code",          amount: "$84.00",  isBase: true  },
  { code: "Mod 59 — add-on panel A",      amount: "$47.00",  isBase: false },
  { code: "XU — add-on panel B",          amount: "$63.00",  isBase: false },
  { code: "XS — separate procedure",      amount: "$41.00",  isBase: false },
  { code: "XE — distinct encounter",      amount: "$55.00",  isBase: false },
];

function fmt$(val) { return "$" + Math.round(val).toLocaleString(); }

export const Scene4ClaimSimulator = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  const labelOp   = interp(lf, [0, 20], [0, 1]);
  const claimOp   = interp(lf, [30, 60], [0, 1]);
  const showSplit  = lf > 220;

  const modifiers = MODIFIERS.map((m, i) => {
    const sf   = 100 + i * 22;
    const prog = spring({ frame: lf - sf, fps, config: { damping: 14, stiffness: 120, mass: 0.6 } });
    return { label: m, prog: clamp(prog, 0, 1), op: clamp(interp(lf, [sf, sf + 14], [0, 1]), 0, 1) };
  });

  const splitRows = SPLIT_ROWS.map((r, i) => {
    const sf   = 230 + i * 28;
    const prog = spring({ frame: lf - sf, fps, config: { damping: 14, stiffness: 100, mass: 0.8 } });
    return { ...r, prog: clamp(prog, 0, 1), op: clamp(interp(lf, [sf, sf + 20], [0, 1]), 0, 1) };
  });

  const totalOp      = interp(lf, [390, 430], [0, 1]);
  const statsOp      = interp(lf, [430, 470], [0, 1]);
  const contextOp    = interp(lf, [470, 510], [0, 1]);
  const gaugeOp      = interp(lf, [420, 460], [0, 1]);
  const needleAngle  = interp(lf, [460, 570], [5, 155]);
  const gaugeLabelOp = interp(lf, [560, 605], [0, 1]);
  const counterVal   = interp(lf, [620, 720], [0, 1800000]);
  const counterOp    = interp(lf, [615, 640], [0, 1]);

  const needlePct = Math.round(interp(lf, [460, 570], [5, 89]));

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs><pattern id="dg4" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
        </pattern></defs>
        <rect width="1920" height="1080" fill="url(#dg4)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 42, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 10, alignItems: "center",
          background: COLORS.amberLight, borderRadius: 100,
          padding: "8px 22px", border: `2px solid ${COLORS.amber}55`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.amber }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.amber }}>
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

      {/* ── LEFT PANEL: claim rows, stats, context ── */}
      <div style={{ position: "absolute", left: 60, top: 120, width: 880, bottom: 60 }}>

        {/* PRE-SPLIT: single clean claim */}
        {!showSplit && (
          <div style={{ opacity: clamp(claimOp, 0, 1) }}>
            <div style={{
              background: "#F8F9FA", border: "2px solid rgba(0,0,0,0.09)",
              borderRadius: 14, padding: "28px 34px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 22,
            }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, color: COLORS.textDark }}>
                  Lab test: base code
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(0,0,0,0.38)", marginTop: 6 }}>
                  CPT 80053 · Same date · Same patient
                </div>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 800, color: COLORS.textDark }}>
                $84.00
              </div>
            </div>

            {/* Modifier tags */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {modifiers.map((m, i) => (
                <div key={i} style={{
                  opacity: m.op,
                  transform: `translateY(${(1 - m.prog) * -26}px) scale(${0.6 + m.prog * 0.4})`,
                  background: COLORS.amberLight, border: `2px solid ${COLORS.amber}66`,
                  borderRadius: 8, padding: "10px 20px",
                  fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 800, color: COLORS.amber,
                }}>{m.label}</div>
              ))}
            </div>
          </div>
        )}

        {/* POST-SPLIT: 5 rows */}
        {showSplit && (
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 20,
              color: "rgba(0,0,0,0.35)", marginBottom: 18, letterSpacing: 0.2,
            }}>
              1 claim → 5 reimbursement lines
            </div>

            {splitRows.map((r, i) => (
              <div key={i} style={{
                opacity: r.op, transform: `translateX(${(1 - r.prog) * -38}px)`,
                marginBottom: 16,
              }}>
                <div style={{
                  background: r.isBase ? "#F8F9FA" : COLORS.redLight,
                  border: `2px solid ${r.isBase ? "rgba(0,0,0,0.09)" : COLORS.red + "44"}`,
                  borderRadius: 12, padding: "18px 28px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 22,
                    fontWeight: r.isBase ? 700 : 500,
                    color: r.isBase ? COLORS.textDark : COLORS.red,
                  }}>{r.code}</div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 26,
                    fontWeight: 800, color: r.isBase ? COLORS.textDark : COLORS.red,
                  }}>{r.amount}</div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div style={{
              opacity: totalOp, marginTop: 10,
              borderTop: `2.5px solid ${COLORS.red}55`, paddingTop: 18,
              display: "flex", justifyContent: "flex-end",
            }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 900, color: COLORS.red }}>
                Total: $290.00 <span style={{ fontWeight: 400, fontSize: 20 }}>(vs $84 base)</span>
              </div>
            </div>

            {/* Stats chips */}
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 36, opacity: statsOp }}>
              {[
                { val: "43,000",    label: "claim lines",    bg: "rgba(0,0,0,0.05)", color: COLORS.textMid },
                { val: "5",         label: "lab providers",  bg: COLORS.redLight,    color: COLORS.red     },
                { val: "99th %ile", label: "all exceed",     bg: COLORS.amberLight,  color: COLORS.amber   },
              ].map(c => (
                <div key={c.label} style={{
                  padding: "14px 24px", borderRadius: 12, background: c.bg,
                  display: "flex", gap: 14, alignItems: "center",
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 900, color: c.color }}>{c.val}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(0,0,0,0.4)" }}>{c.label}</span>
                </div>
              ))}
            </div>

            {/* Context text */}
            <div style={{ marginTop: 32, opacity: contextOp }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 20,
                color: "rgba(0,0,0,0.4)", lineHeight: 1.65,
              }}>
                Base lab codes paired with modifier-separated add-on lines — same date, same patient, same encounter.
                This is not random variation. It is systematic unbundling designed to maximize reimbursement.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Speedometer gauge ── */}
      <div style={{
        position: "absolute", left: 1010, top: 120, width: 850,
        opacity: gaugeOp, paddingTop: 20,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 24,
          fontWeight: 700, color: COLORS.textDark, marginBottom: 30, textAlign: "center",
        }}>Modifier Usage Rate vs. Peer Median</div>

        <div style={{ display: "flex", justifyContent: "center", transform: "scale(0.82)", transformOrigin: "top center", marginBottom: -72 }}>
          <svg width={660} height={420} viewBox="0 0 660 420">
            <path d="M 60 380 A 270 270 0 0 1 600 380"
              fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={56} strokeLinecap="round" />
            <path d="M 60 380 A 270 270 0 0 1 262 100"
              fill="none" stroke={COLORS.green + "55"} strokeWidth={56} strokeLinecap="round" />
            <path d="M 262 100 A 270 270 0 0 1 600 380"
              fill="none" stroke={COLORS.red + "44"} strokeWidth={56} strokeLinecap="round" />

            <text x="106" y="324" fontFamily="Inter,sans-serif" fontSize="20" fill="rgba(0,0,0,0.4)" textAnchor="middle">Normal</text>
            <text x="106" y="348" fontFamily="Inter,sans-serif" fontSize="16" fill="rgba(0,0,0,0.3)" textAnchor="middle">&lt;5%</text>
            <text x="554" y="324" fontFamily="Inter,sans-serif" fontSize="20" fill={COLORS.red} textAnchor="middle">Danger</text>
            <text x="554" y="348" fontFamily="Inter,sans-serif" fontSize="16" fill={COLORS.red + "aa"} textAnchor="middle">35–89%</text>

            <g transform={`rotate(${needleAngle - 90}, 330, 380)`}>
              <line x1={330} y1={380} x2={330} y2={134}
                stroke={COLORS.red} strokeWidth={5.5} strokeLinecap="round" />
              <circle cx={330} cy={380} r={15} fill={COLORS.red} />
            </g>

            <text x="330" y="330"
              fontFamily="Inter,sans-serif" fontSize="60" fontWeight="bold"
              fill={COLORS.red} textAnchor="middle">
              {needlePct}%
            </text>
          </svg>
        </div>

        {/* Callout */}
        <div style={{ opacity: gaugeLabelOp, textAlign: "center", marginTop: 20 }}>
          <div style={{
            display: "inline-block",
            background: COLORS.redLight, border: `2px solid ${COLORS.red}55`,
            borderRadius: 14, padding: "18px 36px",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.red }}>
              All 5 providers exceed the 99th percentile
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(0,0,0,0.45)", marginTop: 6 }}>
              Same date · Same patient · Same encounter
            </div>
          </div>
        </div>

        {/* Provider breakdown table */}
        <div style={{ opacity: gaugeLabelOp, marginTop: 28, paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 700, color: "rgba(0,0,0,0.35)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
            Modifier Rate by Provider
          </div>
          {[
            { id: "Lab A", rate: 89, lines: "11,200" },
            { id: "Lab B", rate: 76, lines: "9,400" },
            { id: "Lab C", rate: 83, lines: "8,600" },
            { id: "Lab D", rate: 71, lines: "7,900" },
            { id: "Lab E", rate: 68, lines: "5,900" },
          ].map((row) => (
            <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 9 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "rgba(0,0,0,0.45)", width: 52 }}>{row.id}</div>
              <div style={{ flex: 1, height: 18, background: "rgba(0,0,0,0.06)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${row.rate}%`, height: "100%", background: COLORS.red, borderRadius: 6, opacity: 0.72 }} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 800, color: COLORS.red, width: 40, textAlign: "right" }}>{row.rate}%</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(0,0,0,0.3)", width: 72, textAlign: "right" }}>{row.lines} lines</div>
            </div>
          ))}
        </div>

        {/* Dollar counter inside right panel */}
        <div style={{ marginTop: 32, paddingLeft: 24, textAlign: "right", opacity: counterOp }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
            color: "rgba(0,0,0,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
          }}>Estimated Exposure</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 72, fontWeight: 900, color: COLORS.amber, letterSpacing: -1 }}>
            {fmt$(counterVal)}
          </div>
        </div>
      </div>
    </div>
  );
};
