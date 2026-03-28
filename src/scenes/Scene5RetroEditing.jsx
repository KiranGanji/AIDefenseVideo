import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const CLAIM_CODES = [
  "CPT 99241 — Office Consultation",
  "CPT 99242 — Office Consultation",
  "CPT 99243 — Office Consultation",
  "CPT 99251 — Inpatient Consultation",
  "CPT 99252 — Inpatient Consultation",
  "CPT 99244 — Office Consultation",
  "CPT 99253 — Inpatient Consultation",
  "CPT 99241 — Office Consultation",
  "CPT 99245 — Office Consultation",
  "CPT 99255 — Inpatient Consultation",
  "CPT 99242 — Office Consultation",
  "CPT 99251 — Inpatient Consultation",
];

function fmt$(val) { return "$" + Math.round(val).toLocaleString(); }

export const Scene5RetroEditing = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  const labelOp = interp(lf, [0, 20], [0, 1]);

  const docSlide = spring({ frame: lf - 30, fps, config: { damping: 16, stiffness: 100, mass: 0.9 } });
  const docOp    = interp(lf, [30, 58], [0, 1]);

  const stampScale = spring({ frame: lf - 120, fps, config: { damping: 8, stiffness: 200, mass: 0.6 } });
  const stampOp    = interp(lf, [120, 140], [0, 1]);

  const claimsFlowOp = interp(lf, [200, 232], [0, 1]);
  const scrollOffset  = interp(lf, [200, 520], [0, -1100]);

  const gateOp   = interp(lf, [245, 275], [0, 1]);
  const gateFlip = interp(lf, [295, 315], [0, 1]);
  const gateColor = gateFlip > 0.5 ? COLORS.green : COLORS.red;
  const gateLabel = gateFlip > 0.5 ? "PASS ✓" : "DENY";

  const glitchOp    = interp(lf, [310, 320], [0, 1]) * interp(lf, [330, 348], [1, 0]);
  const glitchShake = Math.sin(lf * 2.5) * 9 * glitchOp;

  const warnOp  = interp(lf, [445, 485], [0, 1]);
  const statsOp = interp(lf, [525, 565], [0, 1]);

  const counterVal = interp(lf, [575, 675], [0, 1100000]);
  const counterOp  = interp(lf, [570, 596], [0, 1]);

  return (
    <div style={{
      position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden",
      transform: `translateX(${glitchShake}px)`,
    }}>

      {/* Glitch overlay */}
      {glitchOp > 0.01 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `${COLORS.red}18`, pointerEvents: "none", zIndex: 10 }} />
          <svg style={{ position: "absolute", inset: 0, opacity: glitchOp * 0.55, zIndex: 11, pointerEvents: "none" }} width="1920" height="1080">
            {[0,1,2,3,4,5].map(i => (
              <line key={i} x1={i*360-80} y1={0} x2={i*360+240} y2={1080}
                stroke={COLORS.red} strokeWidth={3.5} strokeOpacity={0.4} />
            ))}
          </svg>
        </>
      )}

      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs><pattern id="dg5" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
        </pattern></defs>
        <rect width="1920" height="1080" fill="url(#dg5)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 42, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 10, alignItems: "center",
          background: COLORS.purpleLight, borderRadius: 100,
          padding: "8px 22px", border: `2px solid ${COLORS.purple}55`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.purple }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.purple }}>
            Retro AI Editing
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 42, left: "50%",
        transform: "translateX(-50%)", opacity: labelOp, textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 48, fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5 }}>
          Policy Drift & Recovery Detection
        </div>
      </div>

      {/* ── LEFT PANEL ── */}
      <div style={{ position: "absolute", left: 60, top: 118, width: 860 }}>

        {/* Policy document */}
        <div style={{
          opacity: clamp(docOp, 0, 1),
          transform: `translateX(${(1 - clamp(docSlide, 0, 1)) * -55}px)`,
          background: "#FAFAFA", border: "2px solid rgba(0,0,0,0.09)",
          borderRadius: 16, padding: "34px 38px",
          marginBottom: 36, position: "relative",
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.textDark }}>
              Reimbursement Policy — Consultation CPT Codes
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(0,0,0,0.4)", marginTop: 5 }}>
              Policy ID: RP-2019-041 · Issued: July 2019
            </div>
          </div>
          {[
            { text: "99241–99245 — Office consultations",      red: false },
            { text: "99251–99255 — Inpatient consultations",   red: false },
            { text: "Effective October 1, 2019 — NOT REIMBURSABLE", red: true },
            { text: "Policy is absolute — no modifier or specialty exceptions", red: true },
          ].map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Inter', sans-serif", fontSize: 17,
              color: line.red ? COLORS.red : "rgba(0,0,0,0.5)",
              fontWeight: i === 2 ? 700 : 400,
              marginBottom: 8,
              borderLeft: i === 2 ? `4px solid ${COLORS.red}` : "none",
              paddingLeft: i === 2 ? 12 : 0,
            }}>{line.text}</div>
          ))}

          {/* Red stamp */}
          <div style={{
            position: "absolute", right: 32, top: 28,
            transform: `scale(${clamp(stampScale, 0, 1)}) rotate(-12deg)`,
            opacity: clamp(stampOp, 0, 1),
            border: `3.5px solid ${COLORS.red}`,
            borderRadius: 5, padding: "8px 18px", textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 16,
              fontWeight: 900, color: COLORS.red, letterSpacing: 1.2,
              textTransform: "uppercase",
            }}>NOT<br />REIMBURSABLE</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.red, marginTop: 3 }}>
              Effective Oct 2019
            </div>
          </div>
        </div>

        {/* Gate checkpoint */}
        <div style={{ opacity: clamp(gateOp, 0, 1), display: "flex", alignItems: "center", gap: 24, marginBottom: 36 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, color: "rgba(0,0,0,0.35)" }}>
            Claims flow →
          </div>
          <div style={{
            width: 140, height: 66,
            background: gateColor + "22",
            border: `2.5px solid ${gateColor}88`,
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 900, color: gateColor }}>
              {gateLabel}
            </span>
          </div>
          {gateFlip > 0.5 && (
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 18,
              fontWeight: 700, color: COLORS.red,
              opacity: interp(lf, [320, 360], [0, 1]),
            }}>
              ⚠ Should be DENIED
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", opacity: statsOp, marginBottom: 36 }}>
          {[
            { val: "3,900",    label: "claim lines paid",   bg: "rgba(0,0,0,0.05)", color: COLORS.textMid },
            { val: "FY2025",   label: "paid this year",     bg: COLORS.redLight,    color: COLORS.red     },
            { val: "Oct 2019", label: "policy effective",   bg: COLORS.purpleLight, color: COLORS.purple  },
          ].map(c => (
            <div key={c.label} style={{
              padding: "12px 22px", borderRadius: 10, background: c.bg,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: c.color }}>{c.val}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(0,0,0,0.4)" }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Context text */}
        <div style={{
          opacity: statsOp,
          fontFamily: "'Inter', sans-serif", fontSize: 19,
          color: "rgba(0,0,0,0.38)", lineHeight: 1.65, marginBottom: 36,
        }}>
          Claims passed automation but consistently violated policy intent —<br />
          exactly the kind of drift AI-assisted billing optimization exploits.
        </div>

        {/* Policy gap breakdown */}
        <div style={{ opacity: statsOp }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 700, color: "rgba(0,0,0,0.3)", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 18 }}>
            Why Automation Missed It
          </div>
          {[
            { issue: "Policy loaded at system launch — never re-checked against live edits", icon: "⚠" },
            { issue: "CPT codes structurally valid — rule engine passed on format, not policy", icon: "⚠" },
            { issue: "5-year drift window — $1.1M in overpayments accumulated undetected", icon: "⚠" },
            { issue: "AI retro-scan flagged full cohort in single overnight batch run", icon: "✓" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14,
              opacity: i === 3 ? 1 : 0.75,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: i === 3 ? COLORS.greenLight : COLORS.redLight,
                border: `1.5px solid ${i === 3 ? COLORS.green + "66" : COLORS.red + "44"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13,
              }}>{row.icon}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 16,
                color: i === 3 ? COLORS.green : "rgba(0,0,0,0.45)",
                fontWeight: i === 3 ? 600 : 400, lineHeight: 1.5,
              }}>{row.issue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Flowing claims ── */}
      <div style={{
        position: "absolute", left: 980, top: 118,
        width: 880, height: 820, overflow: "hidden",
      }}>
        <div style={{ opacity: claimsFlowOp, position: "absolute", left: 0, right: 0, top: scrollOffset }}>
          {[...CLAIM_CODES, ...CLAIM_CODES.slice(0, 7)].map((code, i) => (
            <div key={i} style={{
              background: i % 3 === 0 ? COLORS.purpleLight : "#F8F9FA",
              border: `2px solid ${i % 3 === 0 ? COLORS.purple + "44" : "rgba(0,0,0,0.07)"}`,
              borderRadius: 10, padding: "16px 24px",
              marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.textDark }}>
                  {code}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(0,0,0,0.35)", marginTop: 3 }}>
                  2025 · Passed automation
                </div>
              </div>
              <div style={{
                background: COLORS.green + "22", border: `1.5px solid ${COLORS.green}55`,
                borderRadius: 7, padding: "5px 14px",
                fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.green,
              }}>PAID ✓</div>
            </div>
          ))}
        </div>

        {/* Gradient fade at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 160,
          background: "linear-gradient(transparent, white)", pointerEvents: "none",
        }} />

        {/* Warning callout */}
        <div style={{
          position: "absolute", bottom: 34, left: 0, right: 0,
          opacity: warnOp, display: "flex", justifyContent: "center",
        }}>
          <div style={{
            background: COLORS.purpleLight, border: `2.5px solid ${COLORS.purple}66`,
            borderRadius: 16, padding: "20px 36px", textAlign: "center", maxWidth: 780,
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 22,
              fontWeight: 800, color: COLORS.purple, marginBottom: 6,
            }}>
              Claims passed automation — violated policy intent
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(0,0,0,0.5)",
            }}>
              Exactly the kind of drift AI-assisted billing optimization exploits
            </div>
          </div>
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
        }}>Recovery Opportunity</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 72, fontWeight: 900, color: COLORS.purple, letterSpacing: -1 }}>
          {fmt$(counterVal)}
        </div>
      </div>
    </div>
  );
};
