# 🎌 AniTrack

Tu página personal de colección de anime, inspirada en AniList y MyAnimeList.

## Funcionalidades
- 🔍 Búsqueda de anime con filtros (género, año, tipo, estado)
- 📚 5 listas: Viendo, Completado, Pendiente, Pausado, Abandonado
- 📅 Calendario semanal de emisión
- 👤 Perfil con estadísticas y avatar
- 🎨 3 temas: Oscuro, Claro, AMOLED
- ❤️ Favoritos y notas personales
- 💾 Exportar/Importar colección en JSON
- 📊 Estadísticas detalladas

## Instalación rápida

### Requisitos
- Node.js 18+ (https://nodejs.org)

### Pasos
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run dev
# Abre http://localhost:5173

# 3. Compilar para producción
npm run build
# Los archivos quedan en /dist — sube esa carpeta a tu hosting
```

## Despliegue

### Netlify (recomendado — gratis)
1. `npm run build`
2. Arrastra la carpeta `dist/` a https://netlify.com/drop
3. ¡Listo! URL instantánea

### GitHub Pages
1. `npm run build`
2. Sube el contenido de `dist/` a tu repositorio
3. Activa Pages en Settings → Pages → Deploy from branch

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# public dir: dist | SPA: yes
npm run build
firebase deploy
```

### Vercel
```bash
npm install -g vercel
vercel
# Sigue las instrucciones
```

## API
Usa la API gratuita de Jikan v4 (MyAnimeList) — sin registro ni clave.
Los datos se guardan en localStorage del navegador.

## Tecnologías
- React 18 + Vite
- React Router v6
- Zustand (estado global)
- Jikan API v4 (MyAnimeList)
