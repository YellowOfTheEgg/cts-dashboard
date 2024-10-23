import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider, styled } from "@mui/material/styles";
import "./globals.css";
import { Menu } from "./menu";
import Box from "@mui/material/Box";
import { TopBar } from "./topbar";
import theme from "../theme";

export default function RootLayout(props: { children: any }) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex" }}>
              <TopBar />
              <Menu />
              {children}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
