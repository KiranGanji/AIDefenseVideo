import { Composition } from "remotion";
import { AIDefenseVideo } from "./AIDefenseVideo";

export const Root = () => {
  return (
    <Composition
      id="AIDefenseVideo"
      component={AIDefenseVideo}
      durationInFrames={6360}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
