
'use client';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const drawerWidth: number = 300;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })<MuiAppBarProps>(({ theme}) => ({
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`
  }));

  export const TopBar=()=>{

    return(
        <AppBar position="absolute" >
        <Toolbar  
          sx={{
            pr: '24px', // keep right padding when drawer closed
          }}
        >
         
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Clustering Tool Set 1.0
          </Typography>
          
        </Toolbar>
      </AppBar>
    )
  }