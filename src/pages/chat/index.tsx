import React, { useState } from 'react'
import {
    Box, TextField, IconButton, List, ListItem, Drawer, Button
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MessageList from './components/message-list'
import FileDrawer from './components/file-drawer'
import { Message } from '../../models/types'


export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)

    const handleSend = () => {
        if (input.trim()) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: input,
                type: 'text'
            }])
            setInput('')
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: file.name,
                type: 'file',
                file
            }])
        }
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                <MessageList messages={messages} />
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <IconButton color="primary" component="label">
                        <AttachFileIcon />
                        <input type="file" hidden onChange={handleFileUpload} />
                    </IconButton>
                    <IconButton color="primary" onClick={handleSend}>
                        <SendIcon />
                    </IconButton>
                    <Button onClick={() => setDrawerOpen(true)}>📁</Button>
                </Box>
            </Box>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <FileDrawer messages={messages} />
            </Drawer>
        </Box>
    )
}
