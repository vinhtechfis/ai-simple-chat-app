import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MessageList from "./components/message-list";
import FileDrawer from "./components/file-drawer";
import { Message } from "../../models/types";
import { Icon } from "@iconify/react";
import {
  getAllConversations,
  getConversationById,
  sendMessageToAIAgent,
  createConversation,
} from "../../service/conversation";
import {
  getAllDocuments,
  uploadDocumentByConversation,
} from "../../service/documents";

import NewChatModal from "./components/NewChatModal";

export default function ChatPage() {
  const [messageHistories, setMessageHistories] = useState<
    { id: number; title: string; messages: Message[] }[]
  >([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<Message[]>([]);
  const [files, setFiles] = useState<Message[]>([]);
  const [documents, setDocuments] = useState([]);
  const [openModal, setOpenModal] = useState(false);


  const selectedHistory = messageHistories.find(
    (h) => h.id === selectedHistoryId
  );
  const messages = selectedHistory?.messages || [];

 const handleCreateNewChat = async (title: string) => {
   try {
     const response = await createConversation({ conversation_name: title });
     const newId = response.data.conversation.id;

     await fetchConversations();

     handleSelectConversation(newId);
   } catch (err) {
     console.error("Failed to create new chat", err);
   }
 };


const handleSend = async () => {
  const createId = () => Date.now() + Math.floor(Math.random() * 10000);
  if (!input.trim() && pendingFiles.length === 0) return;

  if (!selectedHistoryId) {
    console.warn("No conversation selected.");
    return;
  }

  const newMessages: Message[] = [];

  // Handle user text input
  if (input.trim()) {
    newMessages.push({
      id: createId(),
      text: input,
      type: "text",
    });
  }

  // Upload pending files
  const uploadedDocs: Message[] = [];

  for (const fileMsg of pendingFiles) {
    if (fileMsg.file) {
      try {
        const uploaded = await uploadDocumentByConversation(
          selectedHistoryId,
          fileMsg.file
        );
        uploadedDocs.push({
          id: createId(),
          text: uploaded.document_name,
          type: "file",
          file: fileMsg.file,
        });
      } catch (e) {
        console.error("Failed to upload file:", e);
      }
    }
  }

  // Send message to AI agent
  if (input.trim() || uploadedDocs.length > 0) {
    try {
      const firstFile = uploadedDocs[0]?.file;
      await sendMessageToAIAgent(
        input.trim(),
        selectedSessionId ?? "",
        firstFile
      );

      // ✅ Fetch latest conversation with AI response
      const updated = await getConversationById(selectedHistoryId);
      const chatMessages = (updated.chat_history || []).map((item: any) => ({
        id: item.id,
        text: item.message.content,
        type: item.message.type,
      }));

      setMessageHistories((prev) =>
        prev.map((h) =>
          h.id === selectedHistoryId ? { ...h, messages: chatMessages } : h
        )
      );
    } catch (err) {
      console.error("Failed to send message to AI agent or refresh chat", err);
    }
  }

  // Update drawer files and clear input
  setPendingFiles([]);
  setInput("");

  try {
    const docs = await getAllDocuments();
    setDocuments(docs);
  } catch (err) {
    console.error("Failed to refresh document list", err);
  }
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

  const handleSelectConversation = async (id: number) => {
    try {
      setSelectedHistoryId(id);
      const data = await getConversationById(id);
      const chatMessages = (data.chat_history || []).map((item: any) => ({
        id: item.id,
        text: item.message.content,
        type: item.message.type,
      }));
    setSelectedSessionId(data.conversation.session_id);
      setMessageHistories((prev) =>
        prev.map((h) => (h.id === id ? { ...h, messages: chatMessages } : h))
      );
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleDeleteFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const fetchDocuments = async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const conversations = await getAllConversations();
      const formatted = conversations.map((conv: any) => ({
        id: conv.id,
        title: conv.conversation_name,
        messages: [],
      }));
      setMessageHistories(formatted);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        height: "98vh",
        // border: "1px solid #ccc",
        // boxShadow: 3,
        // borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Left Panel */}
      <Box sx={{ width: 250, bgcolor: "#f4f4f4", p: 2 }}>
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
            <IconButton
              onClick={() => setOpenModal(true)}
              sx={{
                backgroundColor: "#f5f8fb",
                "&:hover": { backgroundColor: "#eef3f7" },
                borderRadius: 2,
              }}
            >
              <Icon icon="akar-icons:edit" width="20" height="20" />
            </IconButton>
          </Tooltip>
        </Box>
        <List>
          {messageHistories.map((h) => (
            <ListItem
              key={h.id}
              button
              selected={h.id === selectedHistoryId}
              onClick={() => handleSelectConversation(h.id)}
              sx={{
                borderRadius: 2,
                mb: 1,
                cursor: "pointer", // 👈 add cursor
                "&.Mui-selected": {
                  backgroundColor: "#000000", // black background when selected
                  color: "#ffffff", // optional: white text on black
                },
                "&:hover": {
                  backgroundColor: "#ffffff", // white background on hover
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
          documents={documents}
          onFileUpload={handleFileUpload}
          onDeleteFile={handleDeleteFile}
        />
      </Box>
      <NewChatModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreateNewChat}
      />
    </Box>
  );
}
