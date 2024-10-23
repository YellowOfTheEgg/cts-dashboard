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
          DOOTS is an outlier detection aglorithm based on over-time clustering.
          For more details read the corresponding
          <Link
            target="_blank"
            href="https://link.springer.com/chapter/10.1007/978-981-15-1699-3_8"
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
