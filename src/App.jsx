import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CollectionPage from './pages/CollectionPage'
import CalendarPage from './pages/CalendarPage'
import AnimePage from './pages/AnimePage'
import ProfilePage from './pages/ProfilePage'
import { auth, db } from "./firebase";
import { getRedirectResult } from "firebase/auth";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Auth from "./components/Auth";

export default function App() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/collection/:status" element={<CollectionPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/anime/:id" element={<AnimePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}



function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔴 SI NO ESTÁ LOGUEADO → LOGIN
  if (!user) {
    return <Auth />;
  }

  // 🟢 SI ESTÁ LOGUEADO → APP
  return (
    <div>
      <h1>Bienvenido {user.displayName}</h1>

      <img
        src={user.photoURL}
        alt="avatar"
        width={50}
        style={{ borderRadius: "50%" }}
      />

      <br />

      <button onClick={() => signOut(auth)}>
        Cerrar sesión
      </button>

      {/* Aquí irá tu app de películas */}
      <p>Tu colección de películas aquí 🎬</p>
    </div>
  );
}

export default App;

useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log("Usuario login:", result.user);
      }
    })
    .catch(console.error);
}, []);

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <h1>Bienvenido {user.displayName}</h1>
    </div>
  );
}

import Profile from "./components/Profile";

function App() {
  return (
    <div>
      <Profile />
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <Navbar user={user} />

      {user ? (
        <h1>Bienvenido {user.displayName}</h1>
      ) : (
        <h1>Por favor inicia sesión</h1>
      )}
    </div>
  );
}

export default App;