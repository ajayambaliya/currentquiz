import "./index.css";
import { Composition } from "remotion";
import { QuizReel } from "./remotion/index";
import { F_INTRO, F_BASE_TOTAL } from "./remotion/Constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Composition
          key={i}
          id={`QuizReel${i}`}
          component={QuizReel}
          durationInFrames={F_INTRO + Math.min(5, 5) * F_BASE_TOTAL}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            reelIndex: i,
          }}
        />
      ))}
    </>
  );
};
