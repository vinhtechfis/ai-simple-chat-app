import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MessageList from "./components/message-list";
import FileDrawer from "./components/file-drawer";
import { Message } from "../../models/types";
import { Icon } from "@iconify/react";


export default function ChatPage() {
  const [messageHistories, setMessageHistories] = useState<
    { id: number; title: string; messages: Message[] }[]
  >([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null
  );
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<Message[]>([]);
  const [files, setFiles] = useState<Message[]>([]);

  const selectedHistory = messageHistories.find(
    (h) => h.id === selectedHistoryId
  );
  const messages = selectedHistory?.messages || [];

  const setMessagesForSelected = (newMessages: Message[]) => {
    setMessageHistories((prev) =>
      prev.map((h) =>
        h.id === selectedHistoryId ? { ...h, messages: newMessages } : h
      )
    );
  };

  const handleNewChat = () => {
    const newId = Date.now();
    const newChat = {
      id: newId,
      title: `Chat at ${new Date().toLocaleTimeString()}`,
      messages: [],
    };
    setMessageHistories((prev) => [...prev, newChat]);
    setSelectedHistoryId(newId);
  };

  const handleSend = () => {
    const createId = () => Date.now() + Math.floor(Math.random() * 10000);
    if (!input.trim() && pendingFiles.length === 0) return;

    const newMessages: Message[] = [];

    if (input.trim()) {
      newMessages.push({
        id: createId(),
        text: input,
        type: "text",
      });
    }

    newMessages.push(...pendingFiles);

    setMessagesForSelected([...messages, ...newMessages]);
    setFiles((prev) => [...prev, ...pendingFiles]);
    setPendingFiles([]);
    setInput("");
  };

  const handleButtonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    const createId = () => Date.now() + Math.floor(Math.random() * 10000);
    if (selected) {
      const newFiles: Message[] = Array.from(selected).map(
        (file) =>
          ({
            id: createId(),
            text: file.name,
            type: "file",
            file,
          } as Message)
      );
      setPendingFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    const createId = () => Date.now() + Math.floor(Math.random() * 10000);
    if (selected) {
      const newFiles: Message[] = Array.from(selected).map(
        (file) =>
          ({
            id: createId(),
            text: file.name,
            type: "file",
            file,
          } as Message)
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDeleteFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "90vh",
        border: "1px solid #ccc",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      {/* Left Panel */}
      <Box sx={{ width: 250, borderRight: "1px solid #ccc", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            AI Chat
          </Typography>
          <Tooltip title="New Chat">
            <Button
              onClick={handleNewChat}
              startIcon={
                <Icon
                  icon="akar-icons:edit"
                  width="24"
                  height="24"
                  style={{ color: "#3f424a" }}
                />
              }
            />
          </Tooltip>
        </Box>
        <List>
          {messageHistories.map((h) => (
            <ListItem
              key={h.id}
              button
              selected={h.id === selectedHistoryId}
              onClick={() => setSelectedHistoryId(h.id)}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": {
                  backgroundColor: "#e0e0e0",
                },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              {h.title}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Middle: Chat Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <MessageList messages={messages} />
        <Box sx={{ display: "flex", gap: 1, mt: "auto", alignItems: "center" }}>
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={"Type a message..."}
          />
          <IconButton color="primary" component="label">
            <AttachFileIcon />
            <input type="file" hidden multiple onChange={handleButtonUpload} />
          </IconButton>
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </Box>

        {/* File Preview Before Sending */}
        {pendingFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {pendingFiles.map((msg, index) => (
              <Box
                key={msg.id}
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "#f0f0f0",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                  maxWidth: "80%",
                }}
              >
                <Box
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  📎 {msg.text}
                </Box>
                <IconButton
                  size="small"
                  onClick={() =>
                    setPendingFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  ❌
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Right Drawer: File Manager */}
      <Box sx={{ width: 300, borderLeft: "1px solid #ccc", p: 2 }}>
        <FileDrawer
          files={files}
          onFileUpload={handleFileUpload}
          onDeleteFile={handleDeleteFile}
        />
      </Box>
    </Box>
  );
}
