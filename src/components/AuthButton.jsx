import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthButton() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: "10px 16px",
        fontSize: "16px",
        cursor: "pointer",
        borderRadius: "8px",
        border: "none",
        background: "#4285F4",
        color: "white"
      }}
    >
      🔑 Login / Register con Google
    </button>
  );
}