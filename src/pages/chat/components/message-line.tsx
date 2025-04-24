import React from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LaunchIcon from "@mui/icons-material/Launch";

interface FileItem {
    name: string;
    url: string;
}

interface FileMessageBoxProps {
    message: string;
    files: FileItem[];
}

const MessageLine: React.FC<FileMessageBoxProps> = ({ message, files }) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end", // 👉 toàn khối canh phải
                width: "100%",
            }}
        >
            <Box
                sx={{
                    bgcolor: "#f0f2f5", // 🌫 nền xám nhạt
                    p: 2,
                    borderRadius: 2,
                    maxWidth: "80%", // 👉 chiếm tối đa 80% container
                    wordBreak: "break-word",
                }}
            >
                <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "text.secondary" }}
                >
                    {message}
                </Typography>

                <Stack spacing={1}>
                    {files.map((file, idx) => (
                        <Button
                            key={idx}
                            variant="outlined"
                            startIcon={<InsertDriveFileIcon fontSize="small" />}
                            endIcon={<LaunchIcon fontSize="small" />}
                            sx={{
                                textTransform: "none",
                                borderColor: "#ddd",
                                bgcolor: "#ffffff",
                                color: "text.primary",
                                borderRadius: 1,
                                px: 1.5,
                                py: 0.8,
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                justifyContent: "flex-start",
                            }}
                            href={file.url}
                            target="_blank"
                        >
                            {file.name}
                        </Button>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default MessageLine;
