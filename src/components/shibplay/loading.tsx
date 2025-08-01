"use client";

import Lottie from "lottie-react";
import boneLoading from "@/animations/bone-loading.json";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Lottie animationData={boneLoading} loop={true} className="size-48" />
    </div>
  );
}
