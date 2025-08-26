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
      console.log("Login successful:");
      localStorage.setItem("token", data.token);
      navigate({to: '/app'});
    },
    onError: (error) => {
      // Handle login error
      console.error("Login failed:", error);
    },
  })
};

// Only for testing purposes

// const fakeLogin = async (data: LoginSchema) => {
//   // Simulate a login API call
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (data.username === "user" && data.password === "pass") {
//         resolve({ user: { id: 1, name: "John Doe" } });
//       } else {
//         reject(new Error("Invalid credentials"));
//       }
//     }, 2000);
//   });
// };
