import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Claim rows: 99291 denied, 99292 paid (the violation pattern)
const CLAIM_ROWS = [
  { id: "CLM-004821", date: "03/12/2024", provider: "NPI 1234567", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-004956", date: "03/14/2024", provider: "NPI 1234567", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-005102", date: "03/19/2024", provider: "NPI 8901234", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-005287", date: "03/22/2024", provider: "NPI 5678901", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-005431", date: "03/28/2024", provider: "NPI 2345678", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-005614", date: "04/02/2024", provider: "NPI 3456789", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-005799", date: "04/07/2024", provider: "NPI 1234567", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-005880", date: "04/11/2024", provider: "NPI 9012345", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-006001", date: "04/15/2024", provider: "NPI 6789012", primary: "99291", addon: "99292", amt: "$5,820" },
  { id: "CLM-006143", date: "04/19/2024", provider: "NPI 1234567", primary: "99291", addon: "99292", amt: "$5,820" },
];

const POLICY_CONDITIONS = [
  { text: "Billed with an eligible primary procedure", code: "99291" },
  { text: "By the same provider", code: "NPI" },
  { text: "On the same date of service", code: "DOS" },
];

function fmtCounter(val) {
  return "$" + Math.round(val).toLocaleString();
}

// Pulsing dot
const PulseDot = ({ color, size = 10, frame }) => {
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.12);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${8 * pulse}px ${color}`,
      transform: `scale(${pulse})`,
      flexShrink: 0,
    }} />
  );
};

export const Scene5RetroEditing = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  // ── Phase 1: Module intro (0–60) ──
  const pillOp    = interp(lf, [0, 20], [0, 1]);
  const titleOp   = interp(lf, [10, 40], [0, 1]);
  const titleY    = interp(lf, [10, 40], [18, 0]);
  const subtitleOp = interp(lf, [30, 60], [0, 1]);

  // ── Phase 2: Policy card (60–200) ──
  const policyOp    = interp(lf, [60, 85], [0, 1]);
  const policySlide = spring({ frame: lf - 60, fps, config: { damping: 18, stiffness: 90, mass: 1 } });

  // Policy conditions stagger in
  const condOp = (i) => interp(lf, [95 + i * 22, 120 + i * 22], [0, 1]);
  const condY  = (i) => interp(lf, [95 + i * 22, 120 + i * 22], [14, 0]);

  // ── Phase 3: Claim mismatch visualization (200–420) ──
  const claimHeaderOp = interp(lf, [200, 228], [0, 1]);
  const colHeaderOp   = interp(lf, [215, 240], [0, 1]);

  // Each claim row staggers in
  const rowOp = (i) => interp(lf, [240 + i * 16, 260 + i * 16], [0, 1]);
  const rowX  = (i) => interp(lf, [240 + i * 16, 260 + i * 16], [28, 0]);

  // Alert badge on "PAID" column
  const alertOp = interp(lf, [330, 365], [0, 1]);
  const alertScale = spring({ frame: lf - 330, fps, config: { damping: 8, stiffness: 200, mass: 0.5 } });

  // ── Phase 4: Scale reveal (420–560) ──
  const statsOp     = interp(lf, [420, 455], [0, 1]);
  const counterVal  = interp(lf, [455, 510], [0, 344]);
  const dollarVal   = interp(lf, [510, 570], [0, 2000000]);
  const dollarOp    = interp(lf, [505, 535], [0, 1]);
  const automationOp = interp(lf, [545, 580], [0, 1]);


  const scrollOffset = interp(lf, [250, 530], [0, -520]);

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      {/* Dot grid */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs>
          <pattern id="dg5v2" width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="1.4" fill={COLORS.purple} />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#dg5v2)" />
      </svg>

      {/* ══ HEADER ══ */}
      <div style={{ position: "absolute", top: 36, left: 60, opacity: pillOp }}>
        <div style={{
          display: "inline-flex", gap: 10, alignItems: "center",
          background: COLORS.purpleLight, borderRadius: 100,
          padding: "12px 28px", border: `2px solid ${COLORS.purple}55`,
        }}>
          <PulseDot color={COLORS.purple} size={10} frame={lf} />
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 20,
            fontWeight: 800, color: COLORS.purple, letterSpacing: 0.4,
          }}>Retro AI Editing</span>
        </div>
      </div>

      <div style={{
        position: "absolute", top: 34, left: "50%",
        transform: `translateX(-50%) translateY(${titleY}px)`,
        textAlign: "center", opacity: titleOp,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 46,
          fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5,
        }}>
          Add-On Codes Policy Leakage
        </div>
      </div>

      <div style={{
        position: "absolute", top: 96, left: "50%",
        transform: "translateX(-50%)",
        opacity: subtitleOp, textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 19,
          color: "rgba(0,0,0,0.45)", fontStyle: "italic",
        }}>
          Turning reimbursement policy into machine-executable logic — surfacing where payments diverge from intent
        </div>
      </div>

      {/* ══ LEFT PANEL: Policy Rule ══ */}
      <div style={{
        position: "absolute", left: 60, top: 152, width: 780,
        opacity: clamp(policyOp, 0, 1),
        transform: `translateX(${(1 - clamp(policySlide, 0, 1)) * -40}px)`,
      }}>

        {/* Policy card */}
        <div style={{
          background: "#FAFAFA", border: "1.5px solid rgba(0,0,0,0.09)",
          borderRadius: 18, padding: "28px 34px", marginBottom: 28,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: COLORS.purple, opacity: 0.7, marginBottom: 10,
          }}>
            Policy Rule · Add-On Codes
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22,
            fontWeight: 700, color: COLORS.textDark, marginBottom: 20, lineHeight: 1.3,
          }}>
            99292 is reimbursable <em>only when</em> billed with eligible primary — same provider, same date
          </div>

          {/* Condition list */}
          {POLICY_CONDITIONS.map((cond, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              marginBottom: 14,
              opacity: condOp(i),
              transform: `translateY(${condY(i)}px)`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: COLORS.purpleLight, border: `1.5px solid ${COLORS.purple}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800,
                color: COLORS.purple,
              }}>{i + 1}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 18,
                color: "rgba(0,0,0,0.7)", flex: 1, lineHeight: 1.4,
              }}>{cond.text}</div>
              <div style={{
                padding: "4px 12px", borderRadius: 6,
                background: COLORS.blueLight, border: `1px solid ${COLORS.blue}44`,
                fontFamily: "monospace", fontSize: 13,
                fontWeight: 700, color: COLORS.blueDark,
              }}>{cond.code}</div>
            </div>
          ))}
        </div>

        {/* Code legend */}
        <div style={{
          display: "flex", gap: 16, alignItems: "center",
          opacity: condOp(2),
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 22px", borderRadius: 10,
            background: COLORS.blueLight, border: `1.5px solid ${COLORS.blue}44`,
          }}>
            <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: COLORS.blueDark }}>99291</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(0,0,0,0.55)" }}>Primary procedure</span>
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 20,
            fontWeight: 300, color: "rgba(0,0,0,0.25)",
          }}>+</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 22px", borderRadius: 10,
            background: COLORS.purpleLight, border: `1.5px solid ${COLORS.purple}44`,
          }}>
            <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: COLORS.purple }}>99292</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(0,0,0,0.55)" }}>Add-on code</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 14, marginTop: 28,
          opacity: statsOp,
        }}>
          {[
            { value: Math.round(counterVal).toLocaleString(), label: "claim lines flagged", bg: COLORS.purpleLight, color: COLORS.purple },
            { value: "99292", label: "paid without 99291", bg: COLORS.redLight, color: COLORS.red },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "16px 22px", borderRadius: 12,
              background: s.bg, border: `1.5px solid ${s.color}33`,
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 36,
                fontWeight: 900, color: s.color, letterSpacing: -1,
              }}>{s.value}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 14,
                color: "rgba(0,0,0,0.55)",
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Passed automation badge */}
        <div style={{
          marginTop: 16, opacity: automationOp,
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 22px", borderRadius: 10,
          background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: 20 }}>⚠️</div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 16,
            color: "rgba(0,0,0,0.65)", lineHeight: 1.5,
          }}>
            These claims <strong style={{ color: COLORS.textDark }}>passed automation</strong> — revealing system gaps exactly where AI-assisted billing optimization exploits policy drift
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL: Claim mismatch table ══ */}
      <div style={{
        position: "absolute", left: 900, top: 152,
        width: 960, height: 750, overflow: "hidden",
      }}>

        {/* Column headers */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 10,
          opacity: colHeaderOp,
          paddingRight: 8,
        }}>
          <div style={{ width: 160, fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>Claim ID</div>
          <div style={{ width: 110, fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>Date</div>
          <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>Provider</div>
          <div style={{ width: 160, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.red + "99" }}>99291 Primary</div>
          <div style={{ width: 160, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.purple + "99" }}>99292 Add-On</div>
        </div>

        {/* Scrolling claim rows */}
        <div style={{
          position: "relative",
          transform: `translateY(${scrollOffset}px)`,
          transition: "none",
        }}>
          {[...CLAIM_ROWS, ...CLAIM_ROWS].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 0,
              background: i % 2 === 0 ? "#F8F9FA" : "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: 10, padding: "12px 16px",
              marginBottom: 8,
              opacity: clamp(rowOp(Math.min(i, 9)), 0, 1),
              transform: `translateX(${rowX(Math.min(i, 9))}px)`,
            }}>
              <div style={{ width: 160, fontFamily: "monospace", fontSize: 14, color: "rgba(0,0,0,0.55)" }}>{row.id}</div>
              <div style={{ width: 110, fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(0,0,0,0.55)" }}>{row.date}</div>
              <div style={{ flex: 1, fontFamily: "monospace", fontSize: 13, color: "rgba(0,0,0,0.45)" }}>{row.provider}</div>

              {/* 99291 — DENIED */}
              <div style={{ width: 160, display: "flex", justifyContent: "center" }}>
                <div style={{
                  padding: "5px 14px", borderRadius: 6,
                  background: COLORS.redLight, border: `1.5px solid ${COLORS.red}44`,
                  fontFamily: "'Inter', sans-serif", fontSize: 13,
                  fontWeight: 700, color: COLORS.red,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span>✕</span> DENIED
                </div>
              </div>

              {/* 99292 — PAID (incorrectly) */}
              <div style={{ width: 160, display: "flex", justifyContent: "center", position: "relative" }}>
                <div style={{
                  padding: "5px 14px", borderRadius: 6,
                  background: `${COLORS.purple}15`,
                  border: `1.5px solid ${COLORS.purple}55`,
                  fontFamily: "'Inter', sans-serif", fontSize: 13,
                  fontWeight: 700, color: COLORS.purple,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span>✓</span> PAID
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
          background: "linear-gradient(transparent, white)",
          pointerEvents: "none",
        }} />

        {/* Alert banner */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          opacity: clamp(alertOp, 0, 1),
          transform: `scale(${clamp(alertScale, 0, 1)})`,
          transformOrigin: "bottom center",
        }}>
          <div style={{
            background: COLORS.purpleLight,
            border: `2.5px solid ${COLORS.purple}66`,
            borderRadius: 16, padding: "18px 32px",
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>🚨</div>
            <div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 20,
                fontWeight: 800, color: COLORS.purple, marginBottom: 4,
              }}>
                344 claim lines · Add-on paid without eligible primary
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 15,
                color: "rgba(0,0,0,0.6)",
              }}>
                99292 reimbursed even though 99291 was denied or unpaid — violating policy intent
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM: Dollar exposure ══ */}
      <div style={{
        position: "absolute", bottom: 48, left: 60,
        opacity: dollarOp,
        display: "flex", alignItems: "center", gap: 28,
      }}>
        <div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: "rgba(0,0,0,0.4)", marginBottom: 4,
          }}>Exposure Identified</div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 76,
            fontWeight: 900, color: COLORS.purple, letterSpacing: -2,
            lineHeight: 1,
          }}>
            {fmtCounter(dollarVal)}
          </div>
        </div>
        <div style={{
          width: 2, height: 80, background: "rgba(0,0,0,0.08)", borderRadius: 2,
        }} />
        <div style={{ maxWidth: 340 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 16,
            color: "rgba(0,0,0,0.55)", lineHeight: 1.55,
          }}>
            Driving roughly <strong style={{ color: COLORS.textDark }}>two million dollars</strong> in exposure — captured by AI retro-scan that traditional post-pay analytics could not detect at this scale
          </div>
        </div>
      </div>


    </div>
  );
};
