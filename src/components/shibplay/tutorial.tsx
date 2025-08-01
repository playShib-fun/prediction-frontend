"use client";

import { IntroDisclosure } from "@/components/ui/intro-disclosure";

const steps = [
  {
    title: "Welcome",
    short_description: "Welcome to ShibPlay!",
    full_description: "ShibPlay is a platform for playing Shib games.",
    media: {
      type: "image",
      src: "/images/tutorial-1.avif",
      alt: "Welcome screen",
    },
  },
  {
    title: "Features",
    short_description: "Key capabilities",
    full_description: "ShibPlay is a platform for playing Shib games.",
    media: {
      type: "image",
      src: "/images/tutorial-2.avif",
      alt: "Features overview",
    },
    action: {
      label: "Try Now",
      onClick: () => console.log("Action clicked"),
    },
  },
];

export function Tutorial() {
  return (
    <IntroDisclosure
      steps={steps as any}
      featureId="shibplay-tutorial"
      onComplete={() => console.log("Completed")}
      onSkip={() => console.log("Skipped")}
      open={true}
      setOpen={() => {}}
    />
  );
}
