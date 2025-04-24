import { List, ListItem, Typography } from '@mui/material'
import { Message } from '../../../models/types'


export default function MessageList({ messages }: { messages: Message[] }) {
    return (
        <List sx={{ overflowY: 'auto', flex: 1 }}>
            {messages.map((msg) => (
                <ListItem key={msg.id}>
                    <Typography variant="body1">
                        {msg.type === 'text' ? msg.text : `📎 File: ${msg.text}`}
                    </Typography>
                </ListItem>
            ))}
        </List>
    )
}
