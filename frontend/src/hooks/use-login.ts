import api from "@/lib/api";
import type { LoginSchema } from "@/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
// Hook for login mutation
export const useLogin = () => {
const navigate = useNavigate({from: '/'});

return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Handle successful login
      console.log("Login successful:", data);
      localStorage.setItem("token", data.authToken);
      localStorage.setItem("Roles", JSON.stringify(data?.user?.["cognito:groups"]));
      navigate({to: '/app'});
    },
    onError: (error) => {
      // Handle login error
      console.error("Login failed:", error);
    },
  })
};