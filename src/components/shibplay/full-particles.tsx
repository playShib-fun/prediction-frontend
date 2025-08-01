"use client";

import { Particles } from "../magicui/particles";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function FullParticles() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
  }, [resolvedTheme]);
  return (
    <Particles
      className="absolute inset-0 z-0"
      quantity={100}
      ease={80}
      color={color}
      refresh
    />
  );
}
