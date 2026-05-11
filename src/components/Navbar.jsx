import AuthButton from "./AuthButton";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar({ user }) {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px"
    }}>
      <h2>NyaFlix 🎬</h2>

      <div>
        {!user ? (
          <AuthButton />
        ) : (
          <>
            <span style={{ marginRight: "10px" }}>
              {user.displayName}
            </span>

            <button onClick={() => signOut(auth)}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}