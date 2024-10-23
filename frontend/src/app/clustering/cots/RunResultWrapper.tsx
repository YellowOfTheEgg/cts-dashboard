"use client";

import { CotsResultContext } from "@/context/cotsContext";
import { RunClustering } from "./RunClustering";
import { Result } from "./Result/Result";
import { useContext } from "react";
import { Conditional } from "@/components/Conditional";

export const RunResultWrapper = () => {
  const { showResultCard } = useContext(CotsResultContext);

  return (
    <>
      <RunClustering />
      <Conditional showWhen={showResultCard}>
        <Result />
      </Conditional>
    </>
  );
};
