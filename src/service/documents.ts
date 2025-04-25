import axios from "axios";

const BASE_URL = "http://192.168.30.233:5003/api/n8n/documents";

/**
 * Get all documents
 */
export const getAllDocuments = async () => {
  const response = await axios.get(BASE_URL);
  return response.data?.data?.documents || [];
};

export const uploadDocumentByConversation = async (conversationId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`http://192.168.30.233:5003/api/n8n/conversation/${conversationId}/document`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data?.document;
};
