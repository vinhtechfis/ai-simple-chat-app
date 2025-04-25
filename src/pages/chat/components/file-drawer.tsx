import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { Message } from "../../../models/types";

export default function FileDrawer({
  files,
  documents,
  onFileUpload,
  onDeleteFile,
}: {
  files: Message[];
  documents: {
    id: number;
    document_name: string;
    url: string;
  }[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile: (id: number) => void;
}) {
  return (
    <Box sx={{ width: 300 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Knowledge Base
        </Typography>
        <IconButton color="primary" component="label">
          📤
          <input type="file" hidden multiple onChange={onFileUpload} />
        </IconButton>
      </Box>

      <List>
        {/* API documents */}
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
                {fileMsg.file?.name ?? fileMsg.text}
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
                      URL.revokeObjectURL(url);
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
