"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#016ab3",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { marginBottom: 20 },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: { marginLeft: 0 },
      },
    },
  },

  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  },
});

export default theme;
