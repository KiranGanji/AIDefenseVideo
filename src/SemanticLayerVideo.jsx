import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionIntroScene } from "./scenes/SolutionIntroScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { AgentsScene } from "./scenes/AgentsScene";
import { ScaleScene } from "./scenes/ScaleScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { SCENES } from "./theme";

// Fade transition between scenes
const SceneWrapper = ({ children, startFrame, endFrame, fadeDuration = 20 }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [startFrame, startFrame + fadeDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = endFrame
    ? interpolate(frame, [endFrame - fadeDuration, endFrame], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const opacity = Math.min(fadeIn, fadeOut);
  const isVisible = frame >= startFrame && (!endFrame || frame <= endFrame + fadeDuration);

  if (!isVisible) return null;

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {children}
    </div>
  );
};

export const SemanticLayerVideo = () => {
  const frame = useCurrentFrame();
  const { TITLE, PROBLEM, SOLUTION_INTRO, ARCHITECTURE, AGENTS, SCALE, SUMMARY } = SCENES;

  return (
    <AbsoluteFill style={{ background: "#070B14", fontFamily: "'Inter', sans-serif" }}>
      {/* Persistent animated background */}
      <Background />

      {/* Scene 1: Title */}
      <SceneWrapper
        startFrame={TITLE.start}
        endFrame={TITLE.start + TITLE.duration}
      >
        <TitleScene startFrame={TITLE.start} />
      </SceneWrapper>

      {/* Scene 2: Problem — Silos */}
      <SceneWrapper
        startFrame={PROBLEM.start}
        endFrame={PROBLEM.start + PROBLEM.duration}
      >
        <ProblemScene startFrame={PROBLEM.start} />
      </SceneWrapper>

      {/* Scene 3: Solution Intro */}
      <SceneWrapper
        startFrame={SOLUTION_INTRO.start}
        endFrame={SOLUTION_INTRO.start + SOLUTION_INTRO.duration}
      >
        <SolutionIntroScene startFrame={SOLUTION_INTRO.start} />
      </SceneWrapper>

      {/* Scene 4: Full Architecture Diagram */}
      <SceneWrapper
        startFrame={ARCHITECTURE.start}
        endFrame={ARCHITECTURE.start + ARCHITECTURE.duration}
      >
        <ArchitectureScene startFrame={ARCHITECTURE.start} />
      </SceneWrapper>

      {/* Scene 5: Agents Integration */}
      <SceneWrapper
        startFrame={AGENTS.start}
        endFrame={AGENTS.start + AGENTS.duration}
      >
        <AgentsScene startFrame={AGENTS.start} />
      </SceneWrapper>

      {/* Scene 6: Scale + Deployment */}
      <SceneWrapper
        startFrame={SCALE.start}
        endFrame={SCALE.start + SCALE.duration}
      >
        <ScaleScene startFrame={SCALE.start} />
      </SceneWrapper>

      {/* Scene 7: Summary + Benefits */}
      <SceneWrapper
        startFrame={SUMMARY.start}
        endFrame={SUMMARY.start + SUMMARY.duration}
      >
        <SummaryScene startFrame={SUMMARY.start} />
      </SceneWrapper>

      {/* Scene progress indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          opacity: 0.4,
        }}
      >
        {Object.entries(SCENES).map(([name, scene], i) => {
          const isActive = frame >= scene.start && frame < scene.start + scene.duration;
          const isPast = frame >= scene.start + scene.duration;
          return (
            <div
              key={name}
              style={{
                width: isActive ? 24 : 6,
                height: 4,
                borderRadius: 2,
                background: isActive ? "#fff" : isPast ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                transition: "width 0.3s",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
