import { Box, Typography } from "@mui/material";
import { marked } from "marked";


export default function MessageLine({
  message,
  files = [],
  type,
}: {
  message: string;
  files?: { name: string; url: string }[];
  type: string;
}) {
  const isAI = type === "ai";
  const htmlMessage = marked(message || "");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isAI ? "flex-start" : "flex-end",
        width: "100%",
        mb: 1,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          maxWidth: "70%",
          bgcolor: isAI ? "transparent" : "#e0f7fa",
          color: "text.primary",
          border: isAI ? "1px solid #ccc" : "none",
        }}
      >
        {isAI ? (
          <Box
            sx={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              "& p": { margin: "8px 0" },
              "& ul": { paddingLeft: "1.2em", margin: "8px 0" },
              "& ol": { paddingLeft: "1.2em", margin: "8px 0" },
              "& code": {
                fontFamily: "monospace",
                backgroundColor: "#f5f5f5",
                px: 0.5,
                borderRadius: 1,
              },
              "& pre": {
                backgroundColor: "#f5f5f5",
                padding: "8px",
                borderRadius: 2,
                overflowX: "auto",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              },
              "& a": {
                color: "#0072e5",
                textDecoration: "underline",
                wordBreak: "break-word",
              },
            }}
            dangerouslySetInnerHTML={{ __html: htmlMessage }}
          />
        ) : (
          <Typography variant="body2">{message}</Typography>
        )}

        {files.length > 0 && (
          <Box mt={1}>
            {files.map((file, idx) => (
              <Typography
                key={idx}
                variant="caption"
                color="primary"
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = file.url;
                  link.setAttribute("download", file.name);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(file.url);
                }}
              >
                📎 {file.name}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
