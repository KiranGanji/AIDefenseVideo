import { Composition } from "remotion";
import { AIDefenseVideo } from "./AIDefenseVideo";

export const Root = () => {
  return (
    <Composition
      id="AIDefenseVideo"
      component={AIDefenseVideo}
      durationInFrames={6300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
