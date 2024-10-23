"use client";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { Link, Typography } from "@mui/material";

export const Description = () => {
  return (
    <Card>
      <CardHeader
        title="Description"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />
      <CardContent>
        <Typography variant="body1">
          C(OTS)² is a clustering algorithm that clusters time series with
          regard to over-time stability. For more details read the corresponding
          <Link
            target="_blank"
            href="https://ieeexplore.ieee.org/document/9308516"
          >
            {" "}
            paper
          </Link>
          . Implementation details can be found on{" "}
          <Link target="_blank" href="https://github.com/tatusch/ots-eval">
            GitHub
          </Link>
          .
        </Typography>
      </CardContent>
    </Card>
  );
};
