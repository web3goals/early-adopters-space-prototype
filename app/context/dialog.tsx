import { createContext, useState } from "react";

interface IDialogContext {
  showDialog: (dialog: any) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<Partial<IDialogContext>>({});

export function DialogProvider({ children }: any) {
  const [dialog, setDialog] = useState(null);

  function showDialog(dialog: any) {
    setDialog(dialog);
  }

  function closeDialog() {
    setDialog(null);
  }

  return (
    <DialogContext.Provider
      value={{
        showDialog: showDialog,
        closeDialog: closeDialog,
      }}
    >
      {children}
      {dialog}
    </DialogContext.Provider>
  );
}
