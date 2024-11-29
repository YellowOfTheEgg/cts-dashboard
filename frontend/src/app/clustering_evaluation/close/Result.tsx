import React, { useEffect, useRef } from "react";
import { Pagination, Typography, IconButton, Box } from "@mui/material";
import { JSX } from "react";
import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { Divider, CardHeader } from "@mui/material";
import Card from "@mui/material/Card";
import { gatewayApi } from "@/utils/api";

const resultEndpoint = "/clustering-evaluation/close/result";

export const Result = () => {
  const [evalResult, setEvalResult] = React.useState(0.21);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gatewayApi
      .get(resultEndpoint, { withCredentials: true })
      .then((response) => {
        setEvalResult(response.data["data"]);
      });
    if (resultRef.current) {
      resultRef.current.scrollIntoView();
    }
  }, []);

  return (
    <Card ref={resultRef}>
      <CardHeader
        title="Result"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />
      <CardContent>
        <Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Typography variant="h3" style={{ wordWrap: "break-word" }}>
              {evalResult}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
