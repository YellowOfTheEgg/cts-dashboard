"use client";

import { ToditsContext } from "@/context/toditsContext";
import { RunOutlierdetection } from "./RunOutlierdetection";
import { Result } from "./Result/Result";
import { useContext } from "react";
import { Conditional } from "@/components/Conditional";

export const RunResultWrapper = () => {
  const { showResultCard } = useContext(ToditsContext);

  return (
    <>
      <RunOutlierdetection />
      <Conditional showWhen={showResultCard}>
        <Result />
      </Conditional>
    </>
  );
};
