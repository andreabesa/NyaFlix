import { loginGoogle, loginGoogleMobile } from "../services/auth";
import { loginGoogle } from "../services/auth";
import { createUserProfile } from "../services/user";

const handleLogin = async () => {
  const result = await loginGoogle();

  const user = result.user;

  await createUserProfile(user);
};

export default function Login() {
  const handleLogin = () => {
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);

    if (isMobile) {
      loginGoogleMobile();
    } else {
      loginGoogle();
    }
  };

  return (
    <div>
      <h2>Inicia sesión</h2>

      <button onClick={handleLogin}>
        Login con Google
      </button>
    </div>
  );
}