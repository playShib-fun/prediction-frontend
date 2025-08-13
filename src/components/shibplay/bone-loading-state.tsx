"use client";

import Lottie from "lottie-react";
import boneLoading from "@/animations/bone-loading.json";
import shibHappy from "@/animations/shib-happy.json";
import shibSad from "@/animations/shib-sad.json";
import shibStare from "@/animations/shib-stare.json";

interface BoneLoadingStateProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl";
  animation?: "bone" | "shib-happy" | "shib-sad" | "shib-stare";
  textClassName?: string;
}

export default function BoneLoadingState({
  text,
  size = "md",
  animation = "bone",
  textClassName,
}: BoneLoadingStateProps) {
  // Use responsive width that scales with parent (card) while preserving a sensible max size
  const sizeMaxWidthClasses = {
    sm: "max-w-32",
    md: "max-w-48",
    lg: "max-w-64",
    xl: "max-w-96",
  } as const;

  const animationData = {
    bone: boneLoading,
    "shib-happy": shibHappy,
    "shib-sad": shibSad,
    "shib-stare": shibStare,
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-full flex items-center justify-center">
        <Lottie
          animationData={animationData[animation]}
          loop={true}
          className={`w-[65%] md:w-[60%] h-auto ${sizeMaxWidthClasses[size]}`}
        />
      </div>
      <p className={`text-center text-gray-100 font-semibold text-xl ${textClassName || ""}`}>
        {text}
      </p>
    </div>
  );
}
