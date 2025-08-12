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
  const sizeClasses = {
    sm: "size-32",
    md: "size-48",
    lg: "size-64",
    xl: "size-96",
  };

  const animationData = {
    bone: boneLoading,
    "shib-happy": shibHappy,
    "shib-sad": shibSad,
    "shib-stare": shibStare,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <Lottie
        animationData={animationData[animation]}
        loop={true}
        className={sizeClasses[size]}
      />
      <p className={`text-center text-gray-100 font-semibold text-xl ${textClassName || ""}`}>
        {text}
      </p>
    </div>
  );
}
