import { Box, SxProps, Typography } from "@mui/material";

// TODO:

/**
 * A component with project activities.
 */
export default function ProjectActivities(props: { id: string; sx?: SxProps }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h4" fontWeight={700} textAlign="center" mt={2}>
        🔥 Activities
      </Typography>
      <Typography textAlign="center" mt={2}>
        that you can do to help the project and get the mystery boxes that will
        be revealed when the project becomes successful
      </Typography>
      <Typography mt={2}>...</Typography>
    </Box>
  );
}
