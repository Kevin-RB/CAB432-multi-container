import { useNavigate, useSearch } from "@tanstack/react-router";
// import { Spinner } from "./ui/kibo-ui/spinner";
import { storeUserInfo } from "@/lib/store";

export function AuthSuccess() {
    const navigate = useNavigate({ from: '/auth/success' });
    const search: { token?: string } = useSearch({ from: '/(auth)/auth/success' });

    if (!search.token) {
        navigate({ to: '/' });
        return null;
    }

    const decoded = JSON.parse(atob(search.token));
    console.log("Decoded token:", decoded);
    storeUserInfo(decoded.authToken, decoded?.user?.["cognito:groups"] || []);
    navigate({ to: '/app' });
    return null
    
    // return (
    //     <div className="flex items-center justify-center min-h-screen">
    //         <div className="text-center">
    //             <Spinner className="mx-auto mb-4" />
    //             <p className="text-2xl font-bold">Completing sign in...</p>
    //         </div>
    //     </div>
    // )
}