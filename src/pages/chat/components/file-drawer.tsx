import { Box, Typography, List, ListItem } from '@mui/material'
import { Message } from '../../../models/types'


export default function FileDrawer({ messages }: { messages: Message[] }) {
    const files = messages.filter(m => m.type === 'file')

    return (
        <Box sx={{ width: 300, p: 2 }}>
            <Typography variant="h6">Uploaded Files</Typography>
            <List>
                {files.map((fileMsg) => (
                    <ListItem key={fileMsg.id}>
                        {fileMsg.file?.name ?? fileMsg.text}
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}
