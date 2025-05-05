import axios from "axios";

const BASE_URL = "http://103.157.218.115:8854/api/n8n/conversation";

export const getAllConversations = async () => {
  const response = await axios.get(BASE_URL, {
    headers: {
      "ngrok-skip-browser-warning": "1",
    },
  });
  return response.data?.data?.conversations || [];
};

export const getConversationById = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "1",
    },
  });
  return response.data.data;
};

export const createConversation = async (payload: { conversation_name: string }) => {
  const response = await axios.post(BASE_URL, payload, {
    headers: {
      "ngrok-skip-browser-warning": "1",
    },
  });
  return response.data;
};

export const updateConversation = async (
  id: number,
  updates: {
    conversation_name?: string;
    session_id?: string;
  }
) => {
  const response = await axios.put(`${BASE_URL}/${id}`, updates, {
    headers: {
      "ngrok-skip-browser-warning": "1",
    },
  });
  return response.data;
};

export const deleteConversation = async (id: string) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "1",
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const sendMessageToAIAgent = async (
  message: string,
  sessionId: string,
  file?: File
) => {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("sessionId", sessionId);
  if (file) {
    formData.append("file", file);
  }

  const response = await axios.post(
    "http://103.157.218.115:5678/webhook/send-message-ai-agent",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "ngrok-skip-browser-warning": "1",
      },
    }
  );

  return response.data;
};