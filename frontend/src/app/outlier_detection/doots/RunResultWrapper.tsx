"use client";

import { DootsContext } from "@/context/dootsContext";
import { RunClustering } from "./RunOutlierdetection";
import { Result } from "./Result/Result";
import { useContext } from "react";
import { Conditional } from "@/components/Conditional";

export const RunResultWrapper = () => {
  const { showResultCard } = useContext(DootsContext);

  return (
    <>
      <RunClustering />
      <Conditional showWhen={showResultCard}>
        <Result />
      </Conditional>
    </>
  );
};
