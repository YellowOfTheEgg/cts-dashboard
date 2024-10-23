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
          DACT is an outlier detection aglorithm based on over-time clustering.
          For more details read the corresponding
          <Link
            target="_blank"
            href="https://doi.org/10.1007/978-3-030-65390-3_28"
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
