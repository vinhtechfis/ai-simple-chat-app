import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import { useSnackbar } from "notistack";
import {
  uploadPatchDocuments,
  getAllDocuments,
  deleteDocumentById,
  uploadDocumentWebhook,
} from "../../../service/documents";

export default function FileDrawerPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<
    { id: string; document_name: string; url: string }[]
  >([]);

const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(Array.from(e.target.files));
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile.length === 0) {
      enqueueSnackbar("Please select files to upload.", { variant: "warning" });
      return;
    }

    try {
      setIsUploading(true);
      for (const file of selectedFile) {
        await uploadPatchDocuments(file);
        await uploadDocumentWebhook(file);
      }
      enqueueSnackbar("Files uploaded successfully!", { variant: "success" });
      setSelectedFile([]);
      fetchDocuments();
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

  const handleDeleteDocument = async (id: string) => {  
    setSelectedDeleteId(id);
    try {
      const res = await deleteDocumentById(id);
      if (res.status === 200) {
        enqueueSnackbar("Xoá file thành công", { variant: "success" });
        await fetchDocuments();
      } else {
        enqueueSnackbar("Xoá file thất bại (status ≠ 200)", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar("Xoá file thất bại", { variant: "error" });
      console.error("Failed to delete document:", err);
    } finally {
      setSelectedDeleteId(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 4,
        p: 2,
        border: 1,
        borderRadius: 4,
        borderColor: "#F2F2F2",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        File Drawer
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton component="label" color="primary">
            <UploadIcon />
            <input type="file" hidden onChange={handleFileChange} multiple />
          </IconButton>
          <Typography variant="body2">
            {selectedFile.length > 0
              ? `${selectedFile.length} file(s) selected`
              : "No file selected"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleFileUpload}
          disabled={isUploading || selectedFile.length === 0}
          sx={{
            backgroundColor: "black",
            color: "white",
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </Box>

      <List>
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            sx={{
              backgroundColor: "#f9f9f9",
              borderRadius: 2,
              mb: 1,
              display: "flex",
              justifyContent: "space-between",
              px: 2,
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InsertDriveFileIcon />
              <Typography variant="body2">{doc.document_name}</Typography>
            </Box>
            <Box>
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

              <IconButton
                size="small"
                disabled={selectedDeleteId === doc.id}
                onClick={() => {
                  setSelectedDeleteId(doc.id);
                  setDeleteDialogOpen(true);
                }}
                sx={{ color: "red" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xoá file này không?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Huỷ</Button>
          <Button
            color="error"
            onClick={async () => {
              if (selectedDeleteId) {
                await handleDeleteDocument(selectedDeleteId);
                setDeleteDialogOpen(false);
                setSelectedDeleteId(null);
              }
            }}
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
