"use client";

import { Gamepad, Gamepad2, Loader } from "lucide-react";
import {
  DynamicIsland,
  DynamicContainer,
  DynamicTitle,
  DynamicDescription,
  useDynamicIslandSize,
} from "../ui/dynamic-island";
import { useStateStore } from "@/stores";
import { useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const { state, setState } = useStateStore((state) => state);
  const { setSize } = useDynamicIslandSize();

  // Move setSize calls to useEffect to avoid setState during render
  useEffect(() => {
    switch (state) {
      case "default":
        setSize("default");
        break;
      case "loading":
        setSize("compact");
        break;
      case "win":
        setSize("large");
        break;
      case "lose":
        setSize("large");
        break;
      case "tutorial":
        setSize("massive");
        break;
    }
  }, [state, setSize]);

  function returnIsland() {
    switch (state) {
      case "default":
        return <Logo />;
      case "loading":
        return <Loading />;
      case "win":
        return <Win />;
      case "lose":
        return <Lose />;
      case "tutorial":
        return <Tutorial />;
    }
  }

  return (
    <header className="mt-4">
      <button>
        <DynamicIsland id="header">{returnIsland()}</DynamicIsland>
      </button>
    </header>
  );
}

function Logo() {
  return (
    <DynamicContainer className="w-full h-full flex items-center justify-center">
      <DynamicTitle className="">
        <Image
          src="/images/shibplay-logo.png"
          alt="ShibPlay"
          width={256}
          height={256}
          className="aspect-square"
        />
      </DynamicTitle>
      <DynamicDescription className="text-md font-bold w-full text-white uppercase flex items-center justify-end px-4">
        Shib<span className="text-primary">Play</span>
      </DynamicDescription>
    </DynamicContainer>
  );
}

function Loading() {
  return (
    <DynamicContainer className="w-full h-full flex items-center justify-center">
      <DynamicTitle className="text-md font-bold w-full text-primary uppercase flex items-center justify-between px-4">
        <Loader className="size-6 animate-spin" />
      </DynamicTitle>
      <DynamicDescription className="text-md font-bold w-full text-white uppercase flex items-center justify-between px-4">
        Loading...
      </DynamicDescription>
    </DynamicContainer>
  );
}

function Win() {
  return (
    <DynamicContainer className="w-full h-full flex items-center justify-center">
      <DynamicTitle className="text-md font-bold w-full text-white uppercase flex items-center justify-between px-4">
        <Gamepad className="size-6" />
      </DynamicTitle>
    </DynamicContainer>
  );
}

function Lose() {
  return (
    <DynamicContainer className="w-full h-full flex items-center justify-center">
      <DynamicTitle className="text-md font-bold w-full text-white uppercase flex items-center justify-between px-4">
        <Gamepad className="size-6" />
      </DynamicTitle>
    </DynamicContainer>
  );
}

function Tutorial() {
  return (
    <DynamicContainer className="w-full h-full flex items-center justify-center">
      <DynamicTitle className="text-md font-bold w-full text-white uppercase flex items-center justify-between px-4">
        <Gamepad className="size-6" />
      </DynamicTitle>
    </DynamicContainer>
  );
}
