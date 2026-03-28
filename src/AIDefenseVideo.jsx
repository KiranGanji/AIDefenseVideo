import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Scene1Threat } from "./scenes/Scene1Threat";
import { Scene2Architecture } from "./scenes/Scene2Architecture";
import { Scene3ImpactRadar } from "./scenes/Scene3ImpactRadar";
import { Scene4ClaimSimulator } from "./scenes/Scene4ClaimSimulator";
import { Scene5RetroEditing } from "./scenes/Scene5RetroEditing";
import { Scene6ThirdPartyGraph } from "./scenes/Scene6ThirdPartyGraph";
import { Scene7Closing } from "./scenes/Scene7Closing";
import { SCENES } from "./theme";

const FADE = 20;

const SceneWrapper = ({ children, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [startFrame, startFrame + FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [endFrame - FADE, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  if (frame < startFrame || frame > endFrame + FADE) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {children}
    </div>
  );
};

export const AIDefenseVideo = () => {
  const frame = useCurrentFrame();
  const { THREAT, ARCH, RADAR, SIMULATOR, RETRO, GRAPH, CLOSING } = SCENES;

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <SceneWrapper startFrame={THREAT.start} endFrame={THREAT.start + THREAT.duration}>
        <Scene1Threat startFrame={THREAT.start} />
      </SceneWrapper>

      <SceneWrapper startFrame={ARCH.start} endFrame={ARCH.start + ARCH.duration}>
        <Scene2Architecture startFrame={ARCH.start} />
      </SceneWrapper>

      <SceneWrapper startFrame={RADAR.start} endFrame={RADAR.start + RADAR.duration}>
        <Scene3ImpactRadar startFrame={RADAR.start} />
      </SceneWrapper>

      <SceneWrapper startFrame={SIMULATOR.start} endFrame={SIMULATOR.start + SIMULATOR.duration}>
        <Scene4ClaimSimulator startFrame={SIMULATOR.start} />
      </SceneWrapper>

      <SceneWrapper startFrame={RETRO.start} endFrame={RETRO.start + RETRO.duration}>
        <Scene5RetroEditing startFrame={RETRO.start} />
      </SceneWrapper>

      <SceneWrapper startFrame={GRAPH.start} endFrame={GRAPH.start + GRAPH.duration}>
        <Scene6ThirdPartyGraph startFrame={GRAPH.start} />
      </SceneWrapper>

      <SceneWrapper startFrame={CLOSING.start} endFrame={CLOSING.start + CLOSING.duration}>
        <Scene7Closing startFrame={CLOSING.start} />
      </SceneWrapper>

      {/* Scene progress dots */}
      <div style={{
        position: "absolute", bottom: 20, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 8, opacity: 0.5, pointerEvents: "none",
      }}>
        {Object.values(SCENES).map((scene, i) => {
          const isActive = frame >= scene.start && frame < scene.start + scene.duration;
          const isPast = frame >= scene.start + scene.duration;
          const isLight = i >= 1 && i <= 5;
          return (
            <div key={i} style={{
              width: isActive ? 24 : 6, height: 4, borderRadius: 2,
              background: isLight
                ? (isActive ? "#185FA5" : isPast ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.12)")
                : (isActive ? "#fff" : isPast ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"),
              transition: "width 0.3s",
            }} />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
