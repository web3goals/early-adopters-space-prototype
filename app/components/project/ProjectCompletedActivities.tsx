import { Box, SxProps, Typography } from "@mui/material";

// TODO:

/**
 * A component with project completed activities.
 */
export default function ProjectCompletedActivities(props: {
  id: string;
  sx?: SxProps;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h4" fontWeight={700} textAlign="center" mt={2}>
        ✨ Completed Activities
      </Typography>
      <Typography textAlign="center" mt={2}>
        that will bring mystery boxes to the authors after accepting by the
        project creator
      </Typography>
      <Typography mt={2}>...</Typography>
    </Box>
  );
}
