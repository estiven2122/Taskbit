# TaskBit - Sistema de Gestión de Tareas

![TaskBit Logo](taskbit/public/LogoProyecto.png)

TaskBit es una aplicación web moderna para la gestión de tareas y alertas con una arquitectura basada en capas separadas entre frontend y backend.

## 📋 Características

- ✅ **Autenticación JWT**: Login y registro de usuarios con tokens seguros
- 📝 **Gestión de Tareas**: Crea, edita y organiza tus tareas
- 🔔 **Sistema de Alertas**: Notificaciones programadas para tus tareas
- 🎨 **Interfaz Moderna**: Diseño responsive con TailwindCSS
- 📚 **API Documentada**: Swagger UI para documentación interactiva
- 🔒 **Seguridad**: BCrypt para contraseñas, JWT para sesiones

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de capas claramente definida:

### Backend (Spring Boot + JWT)
- **View Layer**: Controllers REST
- **Logic Layer**: Services con lógica de negocio
- **Data Access Layer**: Repositories + JPA
- **Security Layer**: JWT + Spring Security
- **Utility Layer**: Swagger para documentación

### Frontend (Next.js)
- **View Layer**: Páginas y componentes UI
- **View Model Layer**: Context para estado global
- **Model Layer**: Services para lógica de negocio
- **Utility Layer**: Componentes reutilizables

## 🚀 Inicio Rápido

### Requisitos
- Java 21+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 12+

### Instalación

1. **Clonar el repositorio**:
```bash
git clone <url-del-repositorio>
cd Taskbit
```

2. **Configurar la base de datos**:
```bash
psql -U postgres
CREATE DATABASE taskbitdb;
```

3. **Iniciar el backend**:
```bash
cd taskbit_Backend
mvn clean install
mvn spring-boot:run
```

4. **Iniciar el frontend** (en otra terminal):
```bash
cd taskbit
npm install
npm run dev
```

5. **Abrir en el navegador**:
- Frontend: http://localhost:3000
- Backend Swagger: http://localhost:8080/swagger-ui.html
- API Health: http://localhost:8080/api/ping

Para instrucciones detalladas, ver **[GUIA_INSTALACION.md](./GUIA_INSTALACION.md)**

## 📖 Documentación

- **[ARQUITECTURA.md](./ARQUITECTURA.md)**: Documentación completa de la arquitectura del proyecto
- **[GUIA_INSTALACION.md](./GUIA_INSTALACION.md)**: Guía paso a paso de instalación
- **Swagger UI**: http://localhost:8080/swagger-ui.html (cuando el backend esté corriendo)

## 🛠️ Tecnologías

### Backend
- Spring Boot 3.5.6
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway (migraciones)
- Lombok
- Swagger/OpenAPI

### Frontend
- Next.js 15.5.6
- React 19
- TailwindCSS 4
- Context API

## 📁 Estructura del Proyecto

```
Taskbit/
├── ARQUITECTURA.md              # Documentación de arquitectura
├── GUIA_INSTALACION.md          # Guía de instalación
├── README.md                    # Este archivo
│
├── taskbit/                     # Frontend (Next.js)
│   └── src/
│       ├── app/                 # Páginas y API routes
│       ├── components/          # Componentes UI
│       ├── context/             # Estado global
│       └── services/            # Servicios de negocio
│
└── taskbit_Backend/             # Backend (Spring Boot)
    └── src/main/java/
        ├── auth/                # Feature de autenticación
        └── com/taskbit/backend/
            ├── security/        # JWT y seguridad
            ├── config/          # Configuración (Swagger)
            ├── user/            # Usuarios
            ├── task/            # Tareas
            └── alert/           # Alertas
```

## 🧪 Testing

### Probar la API con Swagger
1. Abre http://localhost:8080/swagger-ui.html
2. Expande "Autenticación"
3. Prueba `/api/auth/register` para crear un usuario
4. Prueba `/api/auth/login` para obtener un token
5. Haz clic en "Authorize" y usa el token para endpoints protegidos

### Probar con curl
```bash
# Registrar usuario
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔐 Seguridad

- **Contraseñas**: Encriptadas con BCrypt
- **JWT**: Tokens firmados HMAC SHA256
- **CORS**: Configurado para desarrollo
- **CSRF**: Deshabilitado para API REST stateless
- **Validación**: Input validation en backend

## 📝 Desarrollo

### Backend
```bash
cd taskbit_Backend
mvn spring-boot:run          # Ejecutar en desarrollo
mvn package                   # Construir JAR
mvn test                      # Ejecutar tests
```

### Frontend
```bash
cd taskbit
npm run dev                   # Desarrollo
npm run build                 # Producción
npm start                     # Ejecutar build
```

## 🤝 Contribuciones

Este es un proyecto académico siguiendo las especificaciones del diagrama UML proporcionado.

## 📄 Licencia

Proyecto académico - Uso educativo

## 👥 Autores

TaskBit Team

---

**Para más información, consulta [ARQUITECTURA.md](./ARQUITECTURA.md)**
