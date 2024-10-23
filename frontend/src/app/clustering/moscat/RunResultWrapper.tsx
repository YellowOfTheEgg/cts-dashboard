"use client";

import { MoscatContext } from "@/context/moscatContext";
import { RunClustering } from "./RunClustering";
import { Result } from "./Result/Result";
import { useContext } from "react";
import { Conditional } from "@/components/Conditional";

export const RunResultWrapper = () => {
  const { showResultCard } = useContext(MoscatContext);

  return (
    <>
      <RunClustering />
      <Conditional showWhen={showResultCard}>
        <Result />
      </Conditional>
    </>
  );
};
