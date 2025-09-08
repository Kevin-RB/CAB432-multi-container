import api from "@/lib/api";
import type { LoginSchema } from "@/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";

// Hook for signup mutation

export const useSignup = () => {
const navigate = useNavigate({from: '/signup'});

return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await api.post("/auth/signup", data);
      return {
        originalData: data,
        response: response.data
      };
    },
    onSuccess: (result) => {
      // Handle successful signup
      console.log("Signup successful:");
      console.log(result);
      sessionStorage.setItem('pendingUsername', result.originalData.username);
      navigate({to: '/signup/confirmation' });
    },
    onError: (error) => {
      // Handle signup error
      console.error("Signup failed:", error);
    },
  })
};

export const useConfirmSignup = () => {
  const navigate = useNavigate({from: '/signup/confirmation'});

  return useMutation({
    mutationFn: async (data: { username: string; code: string }) => {
      const response = await api.post("/auth/confirm-signup", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Confirmation successful:", data);
      sessionStorage.removeItem('pendingUsername');
      navigate({to: '/app'});
    },
    onError: (error:AxiosError<{ error: string }>) => {
      console.error("Confirmation failed:", error);
    },
  })
}