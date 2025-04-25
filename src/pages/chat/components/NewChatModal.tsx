// components/NewChatModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";

export default function NewChatModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}) {
  const [chatTitle, setChatTitle] = useState("");

  const handleCreate = () => {
    if (chatTitle.trim()) {
      onCreate(chatTitle.trim());
      setChatTitle("");
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          minWidth: 300,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", pb: 1 }}>
        Create New Chat
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Chat Title"
          fullWidth
          variant="outlined"
          value={chatTitle}
          onChange={(e) => setChatTitle(e.target.value)}
          sx={{
            borderRadius: 2,
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", gap: 2, pt: 1, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{ color: "#1976d2", fontWeight: 600 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{ fontWeight: 600 }}
        >
          CREATE
        </Button>
      </DialogActions>
    </Dialog>
  );
}
