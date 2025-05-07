import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { Message } from "../../../models/types";
import {
  uploadPatchDocuments,
  getAllDocuments,
} from "../../../service/documents";
import { useSnackbar } from "notistack";
import UploadIcon from "@mui/icons-material/Upload";

export default function FileDrawer({
  files,
  onDeleteFile,
}: {
  files: Message[];
  onDeleteFile: (id: string) => void;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<
    { id: string; document_name: string; url: string }[]
  >([]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(Array.from(e.target.files));
    }
  };

  // Upload file
  const handleFileUpload = async () => {
    if (selectedFile.length === 0) {
      enqueueSnackbar("Please select files to upload.", { variant: "warning" });
      return;
    }

    try {
      setIsUploading(true);
      for (const file of selectedFile) {
        await uploadPatchDocuments(file); // Upload each file one by one
      }
      enqueueSnackbar("Files uploaded successfully!", { variant: "success" });
      setSelectedFile([]); // Clear selected files after upload
      fetchDocuments(); // Refresh the documents list
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Error uploading files.", { variant: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <Box sx={{ width: "100%", pr: 2, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Knowledge Base
        </Typography>

        {/* File upload area */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
          }}
        >
          {/* Left group: icon + file name */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "hidden",
            }}
          >
            <IconButton
              component="label"
              color="primary"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <UploadIcon />
              <input type="file" hidden onChange={handleFileChange} multiple />
            </IconButton>

            <Typography
              variant="body2"
              sx={{
                maxWidth: 300,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedFile.length > 0
                ? `${selectedFile.length} file(s) selected`
                : "No file selected"}
            </Typography>
          </Box>

          {/* Upload button */}
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </Box>
      </Box>

      <List>
        {documents.map((doc) => (
          <ListItem
            key={`doc-${doc.id}`}
            sx={{
              backgroundColor: "#f0f0f0",
              borderRadius: 2,
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <InsertDriveFileIcon color="action" />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  wordBreak: "break-word", 
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.document_name}
              </Typography>
            </Box>
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = doc.url;
                  link.setAttribute("download", doc.document_name);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}

        {/* Uploaded files */}
        {files.map((fileMsg) => (
          <ListItem
            key={`file-${fileMsg.id}`}
            sx={{
              backgroundColor: "#f0f0f0",
              borderRadius: 2,
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InsertDriveFileIcon color="action" />
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 120,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {fileMsg.file?.name ?? fileMsg.text ?? "Untitled"}
              </Typography>
            </Box>
            <Box>
              {fileMsg.file && (
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const url = URL.createObjectURL(fileMsg.file!);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = fileMsg.file?.name ?? "";
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 100);
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDeleteFile(fileMsg.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
