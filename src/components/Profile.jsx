import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserProfile } from "../services/user";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;

      const data = await getUserProfile(auth.currentUser.uid);
      setProfile(data);
    };

    loadProfile();
  }, []);

  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <img
        src={profile.photoURL}
        alt="avatar"
        width={80}
        style={{ borderRadius: "50%" }}
      />

      <h2>{profile.name}</h2>
      <p>{profile.email}</p>

      <p>Bio: {profile.bio || "Sin bio aún"}</p>
    </div>
  );
}