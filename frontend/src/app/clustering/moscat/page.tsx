"use client";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Description } from "./Description";
import { FileUpload } from "./FileUpload";
import { MoscatProvider } from "@/context/moscatContext";
import { MoscatSettingsContextProvider } from "@/context/moscatSettingsContext";
import { RunResultWrapper } from "./RunResultWrapper";
import { gatewayApi } from "@/utils/api";
import { useEffect } from "react";
import { ClusteringSettings } from "./ClusteringSettings/ClusteringSettings";
import { MoscatSettings } from "./MoscatSettings";

//api endpoints used in this component
const resetEndpoint = "clustering/moscat/reset";

export default function Page() {
  useEffect(() => {
    gatewayApi.post(resetEndpoint);
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
        <MoscatProvider>
          <FileUpload />
          <MoscatSettingsContextProvider>
            <ClusteringSettings />
            <MoscatSettings />
          </MoscatSettingsContextProvider>
          <RunResultWrapper />
        </MoscatProvider>
      </Container>
    </Box>
  );
}
