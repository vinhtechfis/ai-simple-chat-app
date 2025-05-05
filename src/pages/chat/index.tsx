import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  Box,
  // TextField,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputBase,
  Menu, 
  MenuItem,
  Button,
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
  deleteConversation,
} from "../../service/conversation";
import {
  getAllDocuments,
  uploadDocumentByConversation,
  uploadDocuments,
} from "../../service/documents";
import NewChatModal from "./components/NewChatModal";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";


export default function ChatPage() {

  const { enqueueSnackbar } = useSnackbar();

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuForId, setMenuForId] = useState<string | null>(null);


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
  setPendingFiles([]);
  setInput("");

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

  setMessageHistories((prev) =>
    prev.map((h) =>
      h.id === selectedHistoryId
        ? {
            ...h,
            messages: [...h.messages, ...newMessages, ...uploadedDocs],
          }
        : h
    )
  );

  try {
    const firstFile = uploadedDocs[0]?.file;

    await sendMessageToAIAgent(
      trimmedInput,
      selectedSessionId ?? "",
      firstFile
    );

    const data = await getConversationById(selectedHistoryId);

    const chatMessages = (data.chat_history || []).map(
      (item: ChatHistoryItem) => ({
        id: item.id,
        text: item.message.content,
        type: item.message.type, 
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

  const handleOpenMenu = (evt: React.MouseEvent<HTMLElement>, id: string) => {
    evt.stopPropagation();
    setMenuAnchorEl(evt.currentTarget);
    setMenuForId(id);
  };
  // close the menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuForId(null);
  };
  // when user picks “Delete” from the menu, show the dialog
  const handleMenuDelete = () => {
    if (menuForId) {
      setToDeleteId(menuForId);
      setDeleteDialogOpen(true);
    }
    handleCloseMenu();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await deleteConversation(toDeleteId);
      // remove from local state so the UI updates
      setMessageHistories((prev) => prev.filter((h) => h.id !== toDeleteId));
      // if the deleted chat was selected, you may want to clear selectedHistoryId
      if (selectedHistoryId === toDeleteId) {
        setSelectedHistoryId(null);
      }
    } catch {
      // show an error notification
      enqueueSnackbar("Xóa cuộc trò chuyện thất bại", { variant: "error" });
    } finally {
      handleCloseDeleteDialog();
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
        overflow: "hidden",
      }}
    >
      {/* Left Panel */}
      <Box sx={{ width: 250, bgcolor: "#F9F9F9", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            AI Chat
          </Typography>
          <Tooltip
            title="New Chat"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "black",
                  color: "white",
                  fontSize: 14,
                },
              },
            }}
          >
            <IconButton
              onClick={() => setOpenModal(true)}
              sx={{
                backgroundColor: "#f5f8fb",
                "&:hover": { backgroundColor: "#ECECEC" },
                borderRadius: 2,
              }}
            >
              <Icon icon="akar-icons:edit" width="24" height="24" />
            </IconButton>
          </Tooltip>
        </Box>
        <List>
          {messageHistories.map((h) => (
            <ListItem
              key={h.id}
              disableGutters
              disablePadding
              // only show the action-button on hover
              sx={{
                position: "relative",
                "&:hover .action-button": { visibility: "visible" },
              }}
              secondaryAction={
                <IconButton
                  className="action-button"
                  size="small"
                  onClick={(e) => handleOpenMenu(e, h.id)}
                  sx={{
                    visibility: "hidden",
                    // border: "1px solid",
                    borderColor: "divider",
                    width: 32,
                    height: 24,
                    borderRadius: 12,
                    mr:1
                  }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => handleSelectConversation(h.id)}
                selected={h.id === selectedHistoryId}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  pr: 6,
                  "&.Mui-selected": {
                    backgroundColor: "#ECECEC",
                    color: "#000",
                  },
                  "&:hover": { backgroundColor: "#ECECEC" },
                }}
              >
                <ListItemText primary={h.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Middle: Chat Content */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, mr: 10 }}
      >
        <MessageList messages={messages} loadingAI={loadingAI} />
        <Box
          sx={{
            mt: "auto",
            py: 1.5,
            px: 2,
            // borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              maxWidth: 1020,
              bgcolor: "#ffffff",
              borderRadius: "28px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              px: 2,
              py: 1,
            }}
          >
            <InputBase
              fullWidth
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              sx={{
                ml: 1,
                flex: 1,
                fontSize: "0.95rem",
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                component="label"
                size="small"
                sx={{
                  border: "1px solid #e0e0e0",
                  borderColor: "divider",
                  borderRadius: "28px",
                  width: 36,
                  height: 36,
                  p: 0.5, // inner padding
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <AttachFileIcon fontSize="small" />
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleButtonUpload}
                />
              </IconButton>

              {/* Optional Buttons - mimic ChatGPT UI */}
              {/* <IconButton
                size="small"
                sx={{ bgcolor: "#f1f1f1", borderRadius: 3 }}
              >
                <Typography variant="caption">Search</Typography>
              </IconButton> */}
              {/* <IconButton
                size="small"
                sx={{ bgcolor: "#f1f1f1", borderRadius: 3 }}
              >
                <Typography variant="caption">Deep research</Typography>
              </IconButton>
              <IconButton
                size="small"
                sx={{ bgcolor: "#f1f1f1", borderRadius: 3 }}
              >
                <Typography variant="caption">Create image</Typography>
              </IconButton> */}

              {/* Send Button */}
              <IconButton
                color="primary"
                onClick={handleSend}
                sx={{
                  bgcolor: "black",
                  color: "white",
                  "&:hover": { bgcolor: "#333" },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
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

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
      >
        <MenuItem onClick={handleMenuDelete} sx={{ color: "error.main" }}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Delete chat
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xóa cuộc trò chuyện</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa cuộc trò chuyện này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
