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
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
    const drawerWidth = 250;

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
        <>
            <IconButton
                sx={{ position: "absolute", top: 16, left: 16, zIndex: 1300 }}
                onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
                color="primary"
            >
                📂
            </IconButton>
            <Box
                sx={{
                    display: "flex",
                    height: "90vh",
                    border: "1px solid #ccc",
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative", // để nút cố định trên cùng bên trái
                }}
            >
                {/* Nút mở sidebar bên trái */}


                {/* Drawer bên trái */}
                <Drawer
                    variant="persistent"
                    anchor="left"
                    open={leftDrawerOpen}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Button fullWidth onClick={() => setLeftDrawerOpen(false)}>Đóng</Button>
                        <List>
                            <ListItem>🏙️ Quy hoạch</ListItem>
                            <ListItem>📊 Thống kê</ListItem>
                        </List>
                    </Box>
                </Drawer>


                {/* Phần chính Chat */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
                    <MessageList messages={messages} />
                    <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <IconButton color="primary" component="label">
                            <AttachFileIcon />
                            <input type="file" hidden onChange={handleFileUpload} />
                        </IconButton>
                        <IconButton color="primary" onClick={handleSend}>
                            <SendIcon />
                        </IconButton>
                        <Button onClick={() => setRightDrawerOpen(true)}>📁</Button>
                    </Box>
                </Box>

                {/* Drawer bên phải */}
                <Drawer anchor="right" open={rightDrawerOpen} onClose={() => setRightDrawerOpen(false)}>
                    <FileDrawer messages={messages} />
                </Drawer>
            </Box>
        </>


    );
}
