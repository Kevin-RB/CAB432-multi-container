import api from "@/lib/api";
import { authResponseSchema, type LoginSchema  } from "@/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
// Hook for login mutation
export const useLogin = () => {
const navigate = useNavigate({from: '/'});

return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await api.post("/auth/login", data);
      return authResponseSchema.parse(response.data);
    },
    onSuccess: (data) => {
      // Handle successful login
      console.log("Login successful:", data);

      switch(data.challengeName){
        case 'SOFTWARE_TOKEN_MFA':
          navigate({to: '/auth/mfa-verify', search: {session: data.session}});
          break;
        case 'MFA_SETUP':
          navigate({to: '/auth/totp-confirm', search: {
            session: data.session,
            otpauth: data.otpauth,
            userIdForSRP: data.userIdForSRP
          }});
          break;
        default:
          navigate({to: '/'});
          break;
      }
    },
    onError: (error) => {
      // Handle login error
      console.error("Login failed:", error);
    },
  })
};

export const useMfaSetup = () => {

  return useMutation({
    mutationFn: async ({authCode, session, userIdForSRP}: {authCode: string, session: string, userIdForSRP: string}) => {
      const response = await api.post("/auth/verify-totp", {authCode, session, userIdForSRP});
      return response.data;
    },
    onSuccess: (data) => {
      console.log("MFA Setup successful:", data);
    },
    onError: (error) => {
      console.error("MFA Setup failed:", error);
    }
  })
}