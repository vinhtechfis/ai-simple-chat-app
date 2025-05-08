import axios from "axios";

const BASE_URL = "http://103.157.218.115:8854";

/**
 * Get all documents
 */
export const getAllDocuments = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/n8n/documents`, {
      headers: { "ngrok-skip-browser-warning": "1" },
    });
    return response.data?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

export const deleteDocumentById = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/n8n/document/${id}`, {
      headers: { "ngrok-skip-browser-warning": "1" },
    });
    return response;
  } catch (error) {
    console.error(`Failed to delete document with id ${id}:`, error);
    throw error;
  }
};

export const uploadPatchDocuments = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/n8n/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "1",
        },
      }
    );
    return response.data?.data?.document;
  } catch (error) {
    console.error("Failed to upload document:", error);
    throw error;
  }
};

export const uploadDocumentByConversation = async (conversationId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/api/n8n/conversation/${conversationId}/document`,
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
