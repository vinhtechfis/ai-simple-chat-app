import axios from "axios";

const BASE_URL = "http://103.157.218.115:8854/api/n8n/documents";

/**
 * Get all documents
 */
export const getAllDocuments = async () => {
  const response = await axios.get(BASE_URL, {
    headers: {
      "ngrok-skip-browser-warning": "1",
    },
  });
  return response.data?.data?.documents || [];
};

export const uploadDocumentByConversation = async (conversationId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `http://103.157.218.115:8854/api/n8n/conversation/${conversationId}/document`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "ngrok-skip-browser-warning": "1",
      },
    }
  );

  return response.data?.data?.document;
};


export const uploadDocuments = async (
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", "techfis-ai-vector-store");

  const response = await axios.post(
    `http://103.157.218.115:5678/webhook/send-message-ai-agent`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "ngrok-skip-browser-warning": "1",
      },
    }
  );

  return response.data?.data?.document;
};
