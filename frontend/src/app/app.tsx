"use client";
import { ThemeProvider, styled, createTheme } from "@mui/material/styles";
import { TopBar } from "./topbar";
import { Menu } from "./menu";
import Box from "@mui/material/Box";
import { AppBar } from "@mui/material";
import { theme } from "../theme";

export const App = (props: { children: any }) => {
  const { children } = props;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <TopBar />
        <Menu />
        {children}
      </Box>
    </ThemeProvider>
  );
};
