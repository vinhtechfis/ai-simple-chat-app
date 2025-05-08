import { BrowserRouter, Routes } from 'react-router-dom'
import { Route, } from 'react-router-dom'
// import App from '../../App'
import ChatPage from '../../pages/chat'
import FileDrawer from "../../pages/chat/components/file-drawer";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<App />} /> */}
        <Route path="/" element={<ChatPage />} />
        <Route
          path="/file-drawer"
          element={<FileDrawer/>}
        />
      </Routes>
    </BrowserRouter>
  );
}
