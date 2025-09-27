import api from "@/lib/api";
import type { SignupSchema } from "@/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";

// Hook for signup mutation

export const useSignup = () => {
const navigate = useNavigate({from: '/signup'});

return useMutation({
    mutationFn: async (data: SignupSchema) => {
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
      sessionStorage.setItem('pendingUser', JSON.stringify({username: result.originalData.username, email: result.originalData.email}));
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
    mutationFn: async (data: { username: string; email:string, code: string }) => {
      const response = await api.post("/auth/confirm-signup", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Confirmation successful:", data);
      sessionStorage.removeItem('pendingUser');
      navigate({to: '/'});
    },
    onError: (error:AxiosError<{ error: string }>) => {
      console.error("Confirmation failed:", error);
    },
  })
}