import axios from "axios";

const BASE_URL =
  "https://widely-tolerant-gopher.ngrok-free.app/api/n8n/documents";

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
    `https://widely-tolerant-gopher.ngrok-free.app/api/n8n/conversation/${conversationId}/document`,
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

  const response = await axios.post(
    `https://widely-tolerant-gopher.ngrok-free.app/api/n8n/documents`,
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
