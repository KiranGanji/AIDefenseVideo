import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const US_PATH = "M 82,158 L 96,142 L 126,130 L 158,114 L 192,106 L 228,96 L 266,88 L 306,82 L 348,76 L 390,72 L 432,68 L 472,64 L 510,62 L 546,60 L 578,60 L 608,62 L 636,66 L 660,74 L 680,84 L 696,96 L 708,112 L 716,128 L 720,146 L 718,164 L 712,182 L 700,198 L 684,212 L 668,224 L 656,238 L 650,254 L 654,272 L 668,288 L 678,306 L 672,322 L 654,336 L 630,346 L 602,352 L 572,356 L 538,358 L 504,356 L 468,352 L 430,350 L 392,352 L 354,358 L 316,368 L 282,380 L 258,394 L 248,408 L 246,422 L 252,432 L 258,440 L 250,452 L 232,462 L 208,470 L 178,472 L 148,466 L 118,454 L 90,436 L 68,416 L 50,394 L 38,370 L 30,344 L 28,318 L 32,292 L 40,268 L 52,248 L 64,228 L 72,208 L 76,188 L 76,168 Z";

// 47 provider dots across 17 states — denser and more clustered than before
const PROVIDER_DOTS = [
  // California — 5
  { x: 62, y: 202 }, { x: 80, y: 226 }, { x: 58, y: 250 }, { x: 92, y: 248 }, { x: 74, y: 274 },
  // Pacific Northwest — 3
  { x: 92, y: 138 }, { x: 114, y: 150 }, { x: 102, y: 166 },
  // Colorado — 3
  { x: 264, y: 244 }, { x: 288, y: 256 }, { x: 276, y: 272 },
  // Arizona / SW — 4
  { x: 192, y: 310 }, { x: 218, y: 328 }, { x: 246, y: 344 }, { x: 206, y: 350 },
  // Texas — 5
  { x: 298, y: 354 }, { x: 324, y: 366 }, { x: 352, y: 374 }, { x: 312, y: 392 }, { x: 364, y: 354 },
  // Midwest (IL / OH / IN) — 5
  { x: 506, y: 216 }, { x: 530, y: 228 }, { x: 552, y: 242 }, { x: 516, y: 250 }, { x: 542, y: 264 },
  // Missouri / Kansas — 3
  { x: 424, y: 266 }, { x: 448, y: 276 }, { x: 436, y: 292 },
  // Tennessee / Alabama — 3
  { x: 526, y: 298 }, { x: 548, y: 312 }, { x: 568, y: 300 },
  // Georgia / SC — 4
  { x: 578, y: 302 }, { x: 600, y: 314 }, { x: 586, y: 330 }, { x: 616, y: 320 },
  // Florida — 5
  { x: 610, y: 362 }, { x: 632, y: 374 }, { x: 620, y: 392 }, { x: 648, y: 380 }, { x: 626, y: 408 },
  // Mid-Atlantic (PA / NJ) — 4
  { x: 644, y: 192 }, { x: 662, y: 198 }, { x: 658, y: 214 }, { x: 642, y: 208 },
  // New York — 3
  { x: 678, y: 162 }, { x: 696, y: 170 }, { x: 688, y: 184 },
];

// Cluster index ranges:
// CA 0-4 · PNW 5-7 · CO 8-10 · AZ 11-14 · TX 15-19
// Midwest 20-24 · MO 25-27 · TN 28-30 · GA 31-34
// FL 35-39 · MidAtl 40-43 · NY 44-46
const NETWORK_EDGES = [
  // Intra-cluster (short connectors)
  [0,1],[1,2],[2,3],[3,4],[0,4],
  [5,6],[6,7],
  [8,9],[9,10],[8,10],
  [11,12],[12,13],[13,14],[11,14],
  [15,16],[16,17],[17,18],[18,19],[15,19],
  [20,21],[21,22],[22,23],[23,24],[20,24],
  [25,26],[26,27],[25,27],
  [28,29],[29,30],[28,30],
  [31,32],[32,33],[33,34],[31,34],
  [35,36],[36,37],[37,38],[38,39],[35,39],
  [40,41],[41,42],[42,43],[40,43],
  [44,45],[45,46],[44,46],
  // Inter-cluster (coordination web)
  [0,5],[7,8],[10,15],[14,25],[19,25],[24,25],
  [27,31],[30,31],[34,35],[23,40],[24,44],[43,44],
  // Long cross-country connections (statistically suspicious)
  [0,15],[5,20],[19,28],[27,40],
];

function fmt$(val) { return "$" + Math.round(val).toLocaleString(); }

export const Scene6GILabNetwork = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  // Phase 1 — Map
  const labelOp  = interp(lf, [0, 25], [0, 1]);
  const mapOp    = interp(lf, [30, 65], [0, 1]);
  const dotCount  = Math.floor(interp(lf, [70, 280], [0, PROVIDER_DOTS.length]));
  const edgeProg  = interp(lf, [295, 450], [0, 1]);
  const webPulse  = 0.5 + Math.sin(lf * 0.065) * 0.22;

  // Phase 2 — Bar chart
  const barOp        = interp(lf, [460, 495], [0, 1]);
  const nationalBarH = interp(lf, [475, 540], [0, 52]);
  const flaggedBarH  = interp(lf, [495, 600], [0, 300]);
  const spikeOp      = interp(lf, [565, 610], [0, 1]);
  const clinicalOp   = interp(lf, [585, 630], [0, 1]);
  const scopePulse   = 0.92 + Math.sin(lf * 0.14) * 0.08;

  // Phase 3 — DOJ callout (climax)
  const dojProg = spring({ frame: lf - 630, fps, config: { damping: 13, stiffness: 140, mass: 0.65 } });
  const dojOp   = interp(lf, [625, 665], [0, 1]);

  // Phase 4 — Counter
  const counterVal = interp(lf, [712, 760], [0, 3700000]);
  const counterOp  = interp(lf, [708, 732], [0, 1]);

  const MAP_W = 760, MAP_H = 490;

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.lightBg, overflow: "hidden" }}>

      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs><pattern id="dg6n" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.4" fill={COLORS.blue} />
        </pattern></defs>
        <rect width="1920" height="1080" fill="url(#dg6n)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 38, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 12, alignItems: "center",
          background: COLORS.tealLight, borderRadius: 100,
          padding: "14px 32px", border: `2.5px solid ${COLORS.teal}`,
          boxShadow: `0 4px 18px ${COLORS.teal}33`,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: COLORS.teal }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.teal, letterSpacing: 0.5 }}>
            Third Party Network
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 42, left: "50%",
        transform: "translateX(-50%)", opacity: labelOp, textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 48, fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5 }}>
          GI Lab Billing Coordination Network
        </div>
      </div>

      {/* ── LEFT: US Map ── */}
      <div style={{ position: "absolute", left: 40, top: 118, width: MAP_W + 40, opacity: mapOp }}>
        <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ overflow: "visible" }}>
          <path d={US_PATH} fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.20)" strokeWidth={2} />

          {/* Network edges */}
          {NETWORK_EDGES.map(([a, b], i) => {
            const da = PROVIDER_DOTS[a], db = PROVIDER_DOTS[b];
            if (!da || !db) return null;
            const localP = clamp(edgeProg * NETWORK_EDGES.length - i * 0.55, 0, 1);
            const ex = da.x + (db.x - da.x) * localP;
            const ey = da.y + (db.y - da.y) * localP;
            const isLong = Math.abs(da.x - db.x) > 180 || Math.abs(da.y - db.y) > 100;
            return (
              <g key={i} opacity={clamp(webPulse * (isLong ? 0.90 : 0.52), 0, 1)}>
                <line
                  x1={da.x} y1={da.y} x2={ex} y2={ey}
                  stroke={isLong ? COLORS.amber : COLORS.red}
                  strokeWidth={isLong ? 2.5 : 1.5}
                  strokeDasharray={isLong ? "7 4" : "none"}
                />
              </g>
            );
          })}

          {/* Provider dots */}
          {PROVIDER_DOTS.slice(0, dotCount).map((dot, i) => (
            <g key={i}>
              <circle cx={dot.x} cy={dot.y} r={9} fill={COLORS.red} opacity={0.92} />
              <circle cx={dot.x} cy={dot.y} r={18} fill={COLORS.red} opacity={0.14} />
            </g>
          ))}
        </svg>

        {/* Map caption */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 600,
          color: "rgba(0,0,0,0.68)", textAlign: "center", marginTop: 14,
          opacity: dotCount > 8 ? 1 : 0,
        }}>
          47 providers · 17 states · GI labs, pathology, reflex-order protocols
        </div>

        {/* Map insight callout */}
        <div style={{
          marginTop: 20,
          opacity: clamp(edgeProg * 2.2 - 0.8, 0, 1),
          background: COLORS.redLight, border: `2px solid ${COLORS.red}55`,
          borderRadius: 12, padding: "16px 24px",
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 25, fontWeight: 700, color: COLORS.red }}>
            Not random outliers — a coordinated billing pattern
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, color: "rgba(0,0,0,0.68)", marginTop: 6, lineHeight: 1.5 }}>
            Cluster density and cross-state connections are statistically improbable by chance
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ position: "absolute", left: 870, top: 118, width: 990 }}>

        {/* Bar chart */}
        <div style={{ opacity: barOp, marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22,
            fontWeight: 700, color: COLORS.textDark, marginBottom: 22,
          }}>
            Reflex-Order Rate — Flagged vs. National Average
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 44 }}>

            {/* National avg bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 130, height: nationalBarH,
                background: "rgba(0,0,0,0.14)", borderRadius: "8px 8px 0 0",
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8,
              }}>
                {nationalBarH > 22 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 900, color: "rgba(0,0,0,0.55)" }}>
                    11%
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(0,0,0,0.68)", textAlign: "center" }}>
                National avg
              </div>
            </div>

            {/* Flagged providers bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }}>
              {/* >99% spike annotation */}
              <div style={{
                position: "absolute", top: -72, left: "50%", transform: "translateX(-50%)",
                opacity: spikeOp, display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <div style={{
                  background: COLORS.amber, borderRadius: 8,
                  padding: "7px 16px",
                  fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 900, color: "#fff",
                  whiteSpace: "nowrap",
                  boxShadow: `0 4px 14px ${COLORS.amber}55`,
                }}>
                  some &gt;99%
                </div>
                <svg width="2" height="26" style={{ display: "block" }}>
                  <line x1="1" y1="0" x2="1" y2="26" stroke={COLORS.amber} strokeWidth="2.5" strokeDasharray="4 3" />
                </svg>
              </div>

              <div style={{
                width: 130, height: flaggedBarH,
                background: COLORS.red, borderRadius: "8px 8px 0 0",
                boxShadow: `0 6px 28px ${COLORS.red}55`,
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10,
              }}>
                {flaggedBarH > 50 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 900, color: "#fff" }}>
                    67%
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(0,0,0,0.68)", textAlign: "center" }}>
                Flagged providers
              </div>
            </div>

            {/* Side annotation */}
            <div style={{ paddingBottom: 40, opacity: flaggedBarH > 100 ? 1 : 0 }}>
              <div style={{
                background: COLORS.redLight, border: `2px solid ${COLORS.red}44`,
                borderRadius: 14, padding: "16px 22px", maxWidth: 300,
              }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 900, color: COLORS.red }}>
                  6× national rate
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: "rgba(0,0,0,0.68)", marginTop: 6, lineHeight: 1.55 }}>
                  Reflex-order testing billed without individualized clinical justification
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical context with microscope icon */}
        <div style={{
          opacity: clinicalOp,
          display: "flex", alignItems: "flex-start", gap: 22,
          background: COLORS.tealLight, border: `2px solid ${COLORS.teal}55`,
          borderRadius: 14, padding: "20px 28px", marginBottom: 28,
        }}>
          {/* Microscope icon */}
          <div style={{ flexShrink: 0, transform: `scale(${scopePulse})`, transformOrigin: "center" }}>
            <svg width="52" height="62" viewBox="0 0 52 62">
              <rect x="19" y="2" width="14" height="8" rx="3" fill={COLORS.teal} opacity={0.9} />
              <rect x="22" y="9" width="8" height="4" rx="2" fill={COLORS.teal} opacity={0.75} />
              <rect x="21" y="12" width="10" height="20" rx="3" fill={COLORS.teal} opacity={0.85} />
              <rect x="15" y="30" width="22" height="5" rx="2" fill={COLORS.teal} opacity={0.7} />
              <rect x="20" y="34" width="12" height="8" rx="2" fill={COLORS.teal} opacity={0.6} />
              <rect x="8" y="42" width="36" height="7" rx="3" fill={COLORS.teal} opacity={0.82} />
              <circle cx="26" cy="24" r="6" fill="none" stroke={COLORS.teal} strokeWidth="2" opacity={0.55} />
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
              color: COLORS.teal, marginBottom: 8,
            }}>
              GI diagnoses · Reflex-order protocols · Not individualized clinical decisions
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 18,
              color: "rgba(0,0,0,0.68)", lineHeight: 1.6,
            }}>
              Identical test panels ordered across every patient regardless of diagnosis, severity,
              or clinical history — a hallmark of algorithmic billing abuse.
            </div>
          </div>
        </div>

        {/* DOJ Settlement callout — SHARPEST MOMENT — hold here */}
        <div style={{
          opacity: dojOp,
          transform: `scale(${0.92 + clamp(dojProg, 0, 1) * 0.08})`,
          transformOrigin: "top left",
          background: COLORS.blueDark,
          borderRadius: 20, padding: "28px 36px",
          boxShadow: `0 14px 52px rgba(0,0,0,0.30), 0 0 0 3px ${COLORS.amber}`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 26 }}>

            {/* Gavel icon */}
            <div style={{ flexShrink: 0, marginTop: 4 }}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                {/* Gavel head */}
                <rect x="22" y="3" width="24" height="12" rx="4"
                  fill={COLORS.amber}
                  transform="rotate(-45 34 9)" />
                {/* Handle */}
                <line x1="7" y1="47" x2="32" y2="22"
                  stroke={COLORS.amber} strokeWidth="7" strokeLinecap="round" />
                {/* Strike block */}
                <rect x="2" y="44" width="22" height="9" rx="3"
                  fill={COLORS.amber} opacity={0.50} />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800,
                color: COLORS.amber, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10,
              }}>
                DOJ Precedent — Identical Conduct Already Prosecuted
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 900,
                color: "#FFFFFF", lineHeight: 1.2, marginBottom: 12,
                letterSpacing: -0.5,
              }}>
                DOJ settled identical conduct — $4.75M
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 20,
                color: "rgba(255,255,255,0.78)", lineHeight: 1.65,
              }}>
                Reflex-order GI testing billed without individualized clinical need.
                This pattern is not novel — it has already been identified, litigated, and settled by the Department of Justice.
              </div>
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
          fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
          color: "rgba(0,0,0,0.65)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
        }}>
          Estimated Exposure
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 72, fontWeight: 900,
          color: COLORS.teal, letterSpacing: -1,
        }}>
          {fmt$(counterVal)}
        </div>
      </div>
    </div>
  );
};
