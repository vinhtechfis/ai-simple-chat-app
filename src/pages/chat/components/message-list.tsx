import { List, ListItem } from "@mui/material";
import { Message } from "../../../models/types";
import MessageLine from "./message-line";

export default function MessageList({
  messages,
  loadingAI,
}: {
  messages: Message[];
  loadingAI?: boolean; // ✅ thêm prop loadingAI
}) {
  return (
    <List sx={{ overflowY: "auto", flex: 1, pr: 1 }}>
      {messages.map((msg) => {
        const files = [];
        if (msg.file) {
          const localUrl = URL.createObjectURL(msg.file);
          files.push({ name: msg.file.name, url: localUrl });
        }
        return (
          <ListItem key={msg.id} disableGutters>
            <MessageLine files={files} message={msg.text} type={msg.type} />
          </ListItem>
        );
      })}

      {/* Nếu đang loading AI thì hiện thêm dòng Loading */}
      {loadingAI && (
        <ListItem disableGutters>
          <MessageLine message={"..."} type="ai" />
        </ListItem>
      )}
    </List>
  );
}
