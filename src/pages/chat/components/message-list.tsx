import { List, ListItem } from '@mui/material'
import { Message } from '../../../models/types'
import MessageLine from './message-line';


export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <List sx={{ overflowY: "auto", flex: 1, alignSelf: "flex-end" }}>
      {messages.map((msg) => {
        const files = [];
        if (msg.file) {
          files.push({ name: msg.file.name, url: '#' })
        }
        return (
          <ListItem key={msg.id}>
            <MessageLine files={files} message={msg.text} />
          </ListItem>
        )
      }
      )}
    </List>
  );
}
