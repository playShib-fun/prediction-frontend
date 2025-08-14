import Lottie from "lottie-react";
import trophyAnimation from "@/animations/trophy-animation.json";
import { useTrophyAnimationStore } from "@/stores";

export default function TrophyAnimation() {
  const { setIsActive } = useTrophyAnimationStore();
  return (
    <aside className="fixed inset-0 w-screen h-screen bg-black/5 backdrop-blur z-50 flex flex-col gap-2 items-center justify-center">
      <Lottie
        animationData={trophyAnimation}
        loop={false}
        onComplete={() => {
          setIsActive(false);
        }}
      />
    </aside>
  );
}
