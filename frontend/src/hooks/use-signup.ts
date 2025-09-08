import api from "@/lib/api";
import type { LoginSchema } from "@/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

// Hook for signup mutation

export const useSignup = () => {
const navigate = useNavigate({from: '/signup'});

return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await api.post("/auth/signup", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Handle successful signup
      console.log("Signup successful:");
      console.log(data);
      navigate({to: '/signup/confirmation'});
    },
    onError: (error) => {
      // Handle signup error
      console.error("Signup failed:", error);
    },
  })
};