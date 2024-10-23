"use client";

import { CloseContext } from "@/context/closeContext";
import { RunEvaluation } from "./RunEvaluation";
import { Result } from "./Result";
import { useContext } from "react";
import { Conditional } from "@/components/Conditional";

export const RunResultWrapper = () => {
  const { showResultCard } = useContext(CloseContext);

  return (
    <>
      <RunEvaluation />
      <Conditional showWhen={showResultCard}>
        <Result />
      </Conditional>
    </>
  );
};
