import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
  ListItemButton,
  ListItemText,
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
  uploadDocuments,
} from "../../service/documents";

import NewChatModal from "./components/NewChatModal";

export default function ChatPage() {
  const [messageHistories, setMessageHistories] = useState<
  { id: string; title: string; messages: Message[] }[]
  >([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<Message[]>([]);
  const [files, setFiles] = useState<Message[]>([]);
  const [documents, setDocuments] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [openKnowledgeBase, setOpenKnowledgeBase] = useState(false);


   const createId = () =>
     (Date.now() + Math.floor(Math.random() * 10000)).toString();

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

  interface ChatHistoryItem {
    id: string;
    message: {
      content: string;
      type: string;
    };
  }

const handleSend = async () => {
  const createId = () =>
    (Date.now() + Math.floor(Math.random() * 10000)).toString();
  const trimmedInput = input.trim();

  if (!trimmedInput && pendingFiles.length === 0) return;

  if (!selectedHistoryId) {
    console.warn("No conversation selected.");
    return;
  }

  setLoadingAI(true);

  const newMessages: Message[] = [];

  if (trimmedInput) {
    newMessages.push({
      id: createId(),
      text: trimmedInput,
      type: "text",
    });
  }

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

  try {
    const firstFile = uploadedDocs[0]?.file;

    await sendMessageToAIAgent(
      trimmedInput,
      selectedSessionId ?? "",
      firstFile
    );

    // 🚨 FIX: phải fetch bằng selectedHistoryId, không phải sessionId
    const data = await getConversationById(selectedHistoryId);

    const chatMessages = (data.chat_history || []).map(
      (item: ChatHistoryItem) => ({
        id: item.id,
        text: item.message.content,
        type: item.message.type === "human" ? "text" : "text", // 🚨 luôn ép về "text"
      })
    );

    setSelectedSessionId(data.conversation.session_id);

    setMessageHistories((prev) =>
      prev.map((h) =>
        h.id === selectedHistoryId ? { ...h, messages: chatMessages } : h
      )
    );
  } catch (err) {
    console.error("Failed to send message to AI agent or refresh chat", err);
  } finally {
    setPendingFiles([]);
    setInput("");
    setLoadingAI(false);

    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to refresh document list", err);
    }
  }
};


  const handleButtonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected) {
      const newFiles: Message[] = [];

      for (const file of Array.from(selected)) {
        try {
          const uploaded = await uploadDocuments(file);

          newFiles.push({
            id: createId(),
            text: uploaded.document_name,
            type: "file",
            file,
          });
        } catch (error) {
          console.error("Failed to upload file:", error);
        }
      }

      try {
        const docs = await getAllDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to refresh document list after upload", err);
      }
    }
  };

 const handleSelectConversation = async (id: string) => {
   try {
     setSelectedHistoryId(id);
     const data = await getConversationById(id);
     const chatMessages = (data.chat_history || []).map(
       (item: ChatHistoryItem) => ({
         id: item.id,
         text: item.message.content,
         type: item.message.type,
       })
     );
     setSelectedSessionId(data.conversation.session_id);
     setMessageHistories((prev) =>
       prev.map((h) => (h.id === id ? { ...h, messages: chatMessages } : h))
     );
   } catch (err) {
     console.error("Failed to load chat history", err);
   }
 };

  const handleDeleteFile = (id: string) => {
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

  interface Conversation {
    id: string;
    conversation_name: string;
  }

  const fetchConversations = async () => {
    try {
      const conversations = await getAllConversations();
      const formatted = conversations.map((conv: Conversation) => ({
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
            <ListItem key={h.id} disableGutters disablePadding>
              <ListItemButton
                onClick={() => handleSelectConversation(h.id)}
                selected={h.id === selectedHistoryId}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&.Mui-selected": {
                    backgroundColor: "#000000",
                    color: "#ffffff",
                  },
                  "&:hover": {
                    backgroundColor: "#ffffff",
                  },
                }}
              >
                <ListItemText primary={h.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Middle: Chat Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, mr:10 }}>
        <MessageList messages={messages} loadingAI={loadingAI} />
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

      <Box>
        {" "}
        <IconButton
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            width: 60,
            height: 60,
            boxShadow: 6,
          }}
          onClick={() => setOpenKnowledgeBase(true)}
        >
          <Icon icon="fluent:document-48-regular" width="28" height="28" />
        </IconButton>
      </Box>

      {openKnowledgeBase && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setOpenKnowledgeBase(false)}
        >
          <Box
            sx={{
              width: 300,
              maxHeight: "80vh",
              backgroundColor: "white",
              borderRadius: 3,
              p: 2,
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Render lại FileDrawer bên trong Modal */}
            <FileDrawer
              files={files}
              documents={documents}
              onFileUpload={handleFileUpload}
              onDeleteFile={handleDeleteFile}
            />
          </Box>
        </Box>
      )}

      <NewChatModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreateNewChat}
      />
    </Box>
  );
}
