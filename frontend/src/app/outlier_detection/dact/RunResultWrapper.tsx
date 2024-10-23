"use client";

import { DactContext } from "@/context/dactContext";
import { RunOutlierdetection } from "./RunOutlierdetection";
import { Result } from "./Result/Result";
import { useContext } from "react";
import { Conditional } from "@/components/Conditional";

export const RunResultWrapper = () => {
  const { showResultCard } = useContext(DactContext);

  return (
    <>
      <RunOutlierdetection />
      <Conditional showWhen={showResultCard}>
        <Result />
      </Conditional>
    </>
  );
};
