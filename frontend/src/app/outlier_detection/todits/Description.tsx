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
          TODITS is an outlier detection aglorithm based on over-time
          clustering. For more details read the corresponding
          <Link
            target="_blank"
            href="https://doi.org/10.3390/engproc2022018003"
          >
            {" "}
            paper
          </Link>
          . Implementation details can be found on{" "}
          <Link
            target="_blank"
            href="https://github.com/YellowOfTheEgg/mldp-outlier_detection"
          >
            GitHub
          </Link>
          .
        </Typography>
      </CardContent>
    </Card>
  );
};
