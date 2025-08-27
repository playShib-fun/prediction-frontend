"use client";

import * as React from "react";
import { Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DarkModeToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Moon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Dark theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled>Dark theme enabled</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
