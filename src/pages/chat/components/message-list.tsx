import { List, ListItem, Typography } from '@mui/material'
import { Message } from '../../../models/types'


export default function MessageList({ messages }: { messages: Message[] }) {
    return (
      <List sx={{ overflowY: "auto", flex: 1, alignSelf: "flex-end" }}>
        {messages.map((msg) => (
          <ListItem key={msg.id}>
            <Typography
              variant="body1"
              sx={{
                border: "1px solid #ddd",
                borderRadius: 1,
                bgcolor: "#f9f9f9",
                p: 1,
                alignSelf: "flex-end",
                maxWidth: "75%",
                wordBreak: "break-word",
              }}
            >
              {msg.type === "text" ? msg.text : `📎 File: ${msg.text}`}
            </Typography>
          </ListItem>
        ))}
      </List>
    );
}
