import { FormatQuote } from "@mui/icons-material";
import { Dialog, Typography } from "@mui/material";
import { useState } from "react";
import { DialogCenterContent } from "../styled";

export default function ProjectWatchFeedbackDialog(props: {
  content: string;
  isClose?: boolean;
  onClose?: Function;
}) {
  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Function to close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        <FormatQuote sx={{ color: "text.secondary", fontSize: 32 }} />
        <Typography textAlign="center" mt={2}>
          {props.content}
        </Typography>
      </DialogCenterContent>
    </Dialog>
  );
}
