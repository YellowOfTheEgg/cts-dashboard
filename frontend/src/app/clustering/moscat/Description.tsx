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
          MOSCAT is a clustering algorithm that clusters time series over time
          with regard to the temporal context For more details read the
          corresponding
          <Link target="_blank" href="https://www.mdpi.com/2673-4591/68/1/48">
            {" "}
            paper
          </Link>
          . Implementation details can be found on{" "}
          <Link
            target="_blank"
            href="https://github.com/YellowOfTheEgg/itise-moscat"
          >
            GitHub
          </Link>
          .
        </Typography>
      </CardContent>
    </Card>
  );
};
