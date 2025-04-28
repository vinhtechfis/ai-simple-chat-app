import { BrowserRouter, Routes } from 'react-router-dom'
import { Route, } from 'react-router-dom'
// import App from '../../App'
import ChatPage from '../../pages/chat'


export default function AppRouter() {
  return (
    <BrowserRouter basename="/ai-simple-chat-app/">
      <Routes>
        {/* <Route path="/" element={<App />} /> */}
        <Route path="/" element={<ChatPage />} />

      </Routes>
    </BrowserRouter>
  )
}
