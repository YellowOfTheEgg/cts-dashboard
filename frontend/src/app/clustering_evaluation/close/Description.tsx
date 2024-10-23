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
          CLOSE is an algorithm that rates clusterings across time with regard
          to their over-time stability. <b>Note</b>: higher values indicate
          better stability. For more details read the corresponding
          <Link
            target="_blank"
            href="https://www.ibai-publishing.org/html/proceedings_2020/pdf/proceedings_book_MLDM_2020.pdf"
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
