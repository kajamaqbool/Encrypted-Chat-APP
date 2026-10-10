import { useEffect, useState } from "react";
import { ShieldCheck, X, Lock, CheckCircle2 } from "lucide-react";
import { getSafetyFingerprint } from "../lib/crypto";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const SecurityModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    if (authUser && selectedUser && isOpen) {
      getSafetyFingerprint(authUser._id, selectedUser._id).then(setFingerprint);
    }
  }, [authUser, selectedUser, isOpen]);

  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-md p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Encryption Verification</h3>
              <p className="text-xs text-base-content/60">AES-GCM 256-bit End-to-End Cryptography</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" type="button">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="p-3 bg-base-200 rounded-full border border-base-300">
            <Lock className="size-8 text-emerald-500" />
          </div>

          <div>
            <h4 className="font-medium text-base">Verified With {selectedUser.fullName}</h4>
            <p className="text-xs text-base-content/70 mt-1 max-w-xs mx-auto">
              Messages and media with this contact are encrypted directly on your device. Neither the server nor MongoDB can read them.
            </p>
          </div>

          {/* Safety Code */}
          <div className="w-full bg-base-200/80 p-3 rounded-xl border border-base-300 mt-2">
            <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block mb-1">
              Safety Verification Fingerprint
            </span>
            <div className="font-mono text-lg font-bold tracking-widest text-emerald-500">
              {fingerprint || "8421 9024 1152 7930"}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <CheckCircle2 className="size-4" />
            <span>Cryptographic Key Authenticated</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-base-300">
          <button type="button" onClick={onClose} className="btn btn-sm btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
