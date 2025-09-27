import api from "@/lib/api";
import { storeUserInfo } from "@/lib/store";
import { authResponseSchema, successAuthResponseSchema, type LoginSchema  } from "@/schemas/auth";
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
          navigate({to: '/auth/mfa-verify', search: {
            session: data.session,
            userIdForSRP: data.userIdForSRP
          }});
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
  const navigate = useNavigate({ from: '/auth/totp-confirm' })
  
  return useMutation({
    mutationFn: async ({authCode, session, userIdForSRP}: {authCode: string, session: string, userIdForSRP: string}) => {
      const response = await api.post("/auth/verify-totp", {authCode, session, userIdForSRP});
      return response.data;
    },
    onSuccess: (data) => {
      console.log("TOTP submission response:", data);
      const verifiedResult = successAuthResponseSchema.safeParse(data);

      if (!verifiedResult.success) {
          console.error("Response validation failed:", verifiedResult.error);
          return;
      }

      const { roles, idToken } = verifiedResult.data
      storeUserInfo(idToken, roles)

      navigate({ to: '/app' });
    },
    onError: (error) => {
      console.error("MFA Setup failed:", error);
    }
  })
}

export const useConfirmMfa = () => {
  const navigate = useNavigate({ from: '/auth/mfa-verify' })

  return useMutation({
    mutationFn: async ({authCode, session, userIdForSRP}: {authCode: string, session: string, userIdForSRP: string}) => {
      const response = await api.post("/auth/mfa-verify", {authCode, session, userIdForSRP});
      return response.data;
    },
    onSuccess: (data) => {
      console.log("MFA Confirm response:", data);
      const verifiedResult = successAuthResponseSchema.safeParse(data);

      if (!verifiedResult.success) {
          console.error("Response validation failed:", verifiedResult.error);
          return;
      }

      const { roles, idToken } = verifiedResult.data
      storeUserInfo(idToken, roles)

      navigate({ to: '/app' });
    },
    onError: (error) => {
      console.error("MFA Confirm failed:", error);
    }
  })
}