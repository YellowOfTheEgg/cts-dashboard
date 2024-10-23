'use client';
import Container from '@mui/material/Container';


import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Card, CardContent, CardHeader } from '@mui/material';



export default function Page() {
  return (
    <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
<Card>  
<CardHeader title='Home' titleTypographyProps={{component: 'h2', variant:'h6', color:'primary'}}/>
    <CardContent>
    <Typography variant="body1">
    This dashboard is designed for clustering-based analysis of time series. 
                  It contains a set of methods for clustering of time series across time, 
                  evaluation of clusterings and for detection of outliers in time series.
      
             </Typography>
    </CardContent>
</Card>
    
          </Container>
         </Box>
  )
}