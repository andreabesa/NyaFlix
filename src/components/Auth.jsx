import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

export default function Auth() {
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "20px"
    }}>
      <h1>🎬 NyaFlix</h1>

      <button onClick={loginGoogle} style={{
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer"
      }}>
        Iniciar sesión con Google
      </button>
    </div>
  );
}