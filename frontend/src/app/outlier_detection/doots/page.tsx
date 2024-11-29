"use client";
import Container from "@mui/material/Container";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import { Settings } from "./Settings";
import { Description } from "./Description";

import { FileUpload } from "./FileUpload";
import { DootsProvider } from "@/context/dootsContext";

import { RunResultWrapper } from "./RunResultWrapper";

import { gatewayApi } from "@/utils/api";
import { useEffect } from "react";

//api endpoints used in this component
const resetEndpoint = "outlier-detection/doots/reset";

export default function Page() {
  useEffect(() => {
    gatewayApi.post(resetEndpoint, null, { withCredentials: true });
  }, []);

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Toolbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Description />
        <DootsProvider>
          <FileUpload />

          <Settings />

          <RunResultWrapper />
        </DootsProvider>
      </Container>
    </Box>
  );
}
