"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useLoginWithGoogleMutation } from "@/store/api/auth.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

export function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const [loginWithGoogle, { isLoading }] = useLoginWithGoogleMutation();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed. No credential received.");
      return;
    }

    try {
      const res = await loginWithGoogle(credentialResponse.credential).unwrap();
      toast.success(res.message || "Successfully logged in with Google!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      toast.error(err?.data?.message || "Failed to authenticate with NestJS Backend.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full py-2">
      {isLoading ? (
        <div className="flex items-center gap-2 py-2.5 px-5 text-xs font-semibold text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying Google Token...
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google Login Failed")}
          useOneTap={false}
          theme="filled_black"
          shape="pill"
          text="continue_with"
          width="280"
        />
      )}
    </div>
  );
}
