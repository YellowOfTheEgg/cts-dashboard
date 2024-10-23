"use client";
import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import DatasetIcon from "@mui/icons-material/Dataset";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import StarIcon from "@mui/icons-material/Star";
import RadarIcon from "@mui/icons-material/Radar";

import ScoreIcon from "@mui/icons-material/Score";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";

import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import HHULogo from "/public/hhu_logo.png";
import ManchotLogo from "/public/manchot_logo.jpg";
import { Box, Typography } from "@mui/material";

const drawerWidth: number = 300;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    boxSizing: "border-box",
  },
}));

export const Menu = () => {
  const [openClustering, setOpenClustering] = React.useState(true);
  const [openClusteringEvaluation, setOpenClusteringEvaluation] =
    React.useState(true);
  const [openOutlierDetection, setOpenOutlierDetection] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleClusteringClick = () => {
    setOpenClustering(!openClustering);
  };

  const handleClusteringEvaluationClick = () => {
    setOpenClusteringEvaluation(!openClusteringEvaluation);
  };

  const handleOutlierDetectionClick = () => {
    setOpenOutlierDetection(!openOutlierDetection);
  };

  return (
    <React.Fragment>
      <Drawer PaperProps={{ style: { width: 300 } }} variant="permanent">
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            // justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <Image src={HHULogo} alt="HHU Logo" height={64} />
        </Toolbar>
        <Divider />
        <List component="nav">
          <ListItemButton onClick={() => router.push("/")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>

          <ListItemButton onClick={handleClusteringClick}>
            <ListItemIcon>
              <GroupWorkIcon />
            </ListItemIcon>
            <ListItemText primary="Clustering" />
            {openClustering ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openClustering} timeout="auto">
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/clustering/moscat")}
                selected={"/clustering/moscat" === usePathname()}
              >
                <ListItemIcon>
                  <ScatterPlotIcon />
                </ListItemIcon>
                <ListItemText primary="MOSCAT" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/clustering/cots")}
                selected={"/clustering/cots" === usePathname()}
              >
                <ListItemIcon>
                  <ScatterPlotIcon />
                </ListItemIcon>
                <ListItemText primary="C(OTS)²" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton onClick={handleClusteringEvaluationClick}>
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary="Clustering Evaluation" />
            {openClusteringEvaluation ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openClusteringEvaluation} timeout="auto">
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/clustering_evaluation/close")}
                selected={"/clustering_evaluation/close" === usePathname()}
              >
                <ListItemIcon>
                  <ScoreIcon />
                </ListItemIcon>
                <ListItemText primary="CLOSE" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton onClick={handleOutlierDetectionClick}>
            <ListItemIcon>
              <RadarIcon />
            </ListItemIcon>
            <ListItemText primary="Outlier Detection" />
            {openOutlierDetection ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openOutlierDetection} timeout="auto">
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/outlier_detection/doots")}
                selected={"/outlier_detection/doots" === usePathname()}
              >
                <ListItemIcon>
                  <TroubleshootIcon />
                </ListItemIcon>
                <ListItemText primary="DOOTS" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/outlier_detection/dact")}
                selected={"/outlier_detection/dact" === usePathname()}
              >
                <ListItemIcon>
                  <TroubleshootIcon />
                </ListItemIcon>
                <ListItemText primary="DACT" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/outlier_detection/todits")}
                selected={"/outlier_detection/todits" === usePathname()}
              >
                <ListItemIcon>
                  <TroubleshootIcon />
                </ListItemIcon>
                <ListItemText primary="TODITS" />
                {/* Transition based Outlier Dection In Time Series*/}
              </ListItemButton>
            </List>
          </Collapse>
        </List>
        <div style={{ display: "flex", flex: "1 0 auto" }}></div>
        <Divider />

        <Typography
          variant="body2"
          align="center"
          color="textSecondary"
          component="p"
          style={{ paddingLeft: "10px" }}
        >
          Funded by
        </Typography>
        <Image
          src={ManchotLogo}
          alt="Manchot Logo"
          loading="eager"
          priority={true}
          //height={64}
        />
        <Box sx={{ height: "20px" }}></Box>
      </Drawer>
    </React.Fragment>
  );
};
