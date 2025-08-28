import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook for receipt upload mutation
export const useUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("receipt-image", file);
      
      const response = await api.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes (180 seconds)
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Handle successful upload
      console.log("Upload successful:", data);
      queryClient.invalidateQueries({queryKey: ['receipts']});
    },
    onError: (error) => {
      // Handle upload error
      console.error("Upload failed:", error);
    },
  });
};
