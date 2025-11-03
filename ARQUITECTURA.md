# Arquitectura del Proyecto TaskBit

Este documento describe la estructura arquitectónica del proyecto TaskBit, siguiendo el diseño especificado en el diagrama UML.

## Visión General

El proyecto está dividido en dos componentes principales:
- **Frontend**: Next.js (React)
- **Backend**: Spring Boot + JWT

## Arquitectura del Backend (Spring Boot + JWT)

### Capas y Componentes

#### 1. **View Layer (Controller)**
Los controladores REST manejan las solicitudes HTTP y devuelven respuestas.

**Ubicación**: `src/main/java/auth/controller/`, `src/main/java/com/taskbit/backend/api/`

**Archivos principales**:
- `AuthController.java` - Endpoints de autenticación (`/api/auth/login`, `/api/auth/register`)
- `HealthController.java` - Endpoint de salud (`/api/ping`)
- `ProtectedController.java` - Endpoints protegidos que requieren JWT

**Características**:
- `@RestController` - Marca los controladores REST
- `@RequestMapping` - Define las rutas base
- `@Operation` y `@Tag` de Swagger - Documentación de API

#### 2. **Logic Layer (Service)**
Contiene la lógica de negocio de la aplicación.

**Ubicación**: `src/main/java/auth/service/`

**Archivos principales**:
- `UserService.java` - Lógica de autenticación y registro de usuarios
  - `registerUser()` - Registra nuevos usuarios con validación
  - `authenticate()` - Autentica usuarios y verifica credenciales

**Características**:
- `@Service` - Marca los servicios de Spring
- `@Transactional` - Gestiona transacciones de base de datos
- Inyección de dependencias: Repository y PasswordEncoder

#### 3. **Data Access Layer (Repository)**
Interfaz con la base de datos mediante JPA.

**Ubicación**: `src/main/java/com/taskbit/backend/*/`

**Archivos principales**:
- `AppUserRepository.java` - Repositorio de usuarios (extiende `JpaRepository`)
- `TaskRepository.java` - Repositorio de tareas
- `AlertRepository.java` - Repositorio de alertas

**Características**:
- `@Repository` - Marca los repositorios
- Extiende `JpaRepository<Entity, ID>` de Spring Data JPA
- Métodos de consulta personalizados (ej: `findByEmail()`)

**Singleton Model (Entities)**:
- `AppUser.java` - Entidad de usuario
- `Task.java` - Entidad de tarea
- `Alert.java` - Entidad de alerta

**Características**:
- `@Entity` y `@Table` - Mapeo ORM
- `@Builder`, `@Getter`, `@Setter` de Lombok - Reduce boilerplate
- Relaciones JPA con `@ManyToOne`, `@OneToMany`

#### 4. **Security Layer**
Implementa autenticación y autorización con JWT.

**Ubicación**: `src/main/java/com/taskbit/backend/security/`

**Archivos principales**:
- `SecurityConfig.java` - Configuración de Spring Security
  - Define CORS, CSRF, y políticas de seguridad
  - Configura el filtro JWT
- `JwtAuthenticationFilter.java` - Filtro que valida tokens JWT en cada request
- `JwtUtil.java` - Utilidades para generar y validar tokens JWT

**Características**:
- `@Configuration` - Configuración de Spring
- `@Component` - Filtro personalizado de Spring Security
- Filtrado de peticiones con `OncePerRequestFilter`

#### 5. **Utility Layer - Swagger**
Documentación automática de la API REST.

**Ubicación**: `src/main/java/com/taskbit/backend/config/`

**Archivos principales**:
- `SwaggerConfig.java` - Configuración de OpenAPI/Swagger
  - Define información de la API
  - Configura autenticación Bearer (JWT)

**Características**:
- Accesible en `/swagger-ui.html`
- Documentación interactiva de endpoints
- Soporte para autenticación JWT en la documentación

### Tecnologías Utilizadas

- **Spring Boot 3.5.6**: Framework principal
- **JWT (JJWT 0.11.5)**: Autenticación con tokens
- **JPA/Hibernate**: Mapeo objeto-relacional
- **Lombok**: Reducción de código boilerplate
- **PostgreSQL**: Base de datos
- **Flyway**: Migraciones de base de datos
- **Swagger/OpenAPI 2.3.0**: Documentación de API
- **BCrypt**: Encriptación de contraseñas

## Arquitectura del Frontend (Next.js)

### Capas y Componentes

#### 1. **View Layer (Pages)**
Componentes de presentación que renderizan la UI.

**Ubicación**: `src/app/`

**Archivos principales**:
- `page.js` - Página de registro (home)
- `login/page.js` - Página de login
- `dashboard/page.js` - Dashboard principal (requiere autenticación)

**Características**:
- React Server Components (por defecto)
- `"use client"` donde se necesita interactividad
- Estilos con TailwindCSS

**API Routes** (Next.js API layer):
- `app/api/register/route.js` - Proxy para registro
- `app/api/login/route.js` - Proxy para login

#### 2. **View Model Layer (Context)**
Gestiona el estado global de la aplicación.

**Ubicación**: `src/context/`

**Archivos principales**:
- `auth.context.js` - Context de autenticación global
  - `AuthProvider` - Proveedor de contexto
  - `useAuth()` - Hook personalizado para acceso

**Características**:
- React Context API
- Estado global de autenticación
- Manejo de estado de carga

#### 3. **Model Layer (Services)**
Servicios que abstraen la lógica de negocio y comunicación con APIs.

**Ubicación**: `src/services/`

**Archivos principales**:
- `auth.service.js` - Servicio de autenticación
  - `login()` - Almacena token y usuario
  - `logout()` - Limpia datos de sesión
  - `isAuthenticated()` - Verifica estado
  - `getToken()`, `getUser()` - Acceso a datos
- `http.client.js` - Cliente HTTP personalizado
  - `fetch()`, `get()`, `post()`, `put()`, `delete()`
  - Inyección automática de token JWT
  - Manejo de errores 401

**Características**:
- Clases estáticas con métodos singleton
- LocalStorage para persistencia
- Headers automáticos con JWT

#### 4. **Utility Layer**
Componentes y utilidades reutilizables.

**Ubicación**: `src/components/`

**Archivos principales**:
- `AuthGuard.js` - Componente de protección de rutas
  - Verifica autenticación antes de renderizar
  - Redirige a login si no está autenticado

**Características**:
- Componente HOC (Higher-Order Component)
- Guard de navegación
- Rutas públicas vs privadas

## Dependencias y Relaciones

### Backend
```
View Layer (Controller) 
    ↓ @Inject
Logic Layer (Service)
    ↓ @Inject
Data Access Layer (Repository)
    ↓ @Extends
JPA
```

**Externas**:
- Security → JWT
- Model → Lombok
- Configuration → Swagger

### Frontend
```
View Layer (Pages)
    ↓ use
View Model Layer (Context)
    ↓ use
Model Layer (Services)
    ↓ use
Utility Layer (Components)
```

**Externas**:
- HttpClient → AuthService
- Pages → Components

## Flujo de Autenticación

1. **Registro**:
   - Frontend (View) → API Route (Next.js) → Backend (Controller)
   - Service valida y crea usuario
   - Repository persiste en DB

2. **Login**:
   - Frontend (View) → API Route → Backend (Controller)
   - Service autentica credenciales
   - JwtUtil genera token
   - Frontend almacena token en localStorage

3. **Requests Protegidos**:
   - Frontend incluye token en header
   - JwtAuthenticationFilter valida token
   - Security permite acceso si es válido

## Configuración de Seguridad

### Backend
- CORS configurado para `http://localhost:3000`
- CSRF deshabilitado para API REST stateless
- JWT expiration: 3600000ms (1 hora)
- Rutas públicas: `/api/auth/**`, `/api/ping`
- Rutas protegidas: todas las demás

### Frontend
- Token almacenado en localStorage
- Auto-redirección en 401
- Guards de ruta en frontend
- HTTPS recomendado en producción

## Estructura de Directorios

```
Taskbit/
├── taskbit/                     # Frontend Next.js
│   └── src/
│       ├── app/                 # View Layer
│       │   ├── page.js
│       │   ├── login/
│       │   ├── dashboard/
│       │   └── api/            # API Routes
│       ├── components/          # Utility Layer
│       │   └── AuthGuard.js
│       ├── context/             # View Model Layer
│       │   └── auth.context.js
│       └── services/            # Model Layer
│           ├── auth.service.js
│           └── http.client.js
│
└── taskbit_Backend/             # Backend Spring Boot
    └── src/main/java/
        ├── auth/                # Auth Feature
        │   ├── controller/      # View Layer
        │   │   └── AuthController.java
        │   ├── service/         # Logic Layer
        │   │   └── UserService.java
        │   └── dto/
        ├── com/taskbit/backend/
        │   ├── security/        # Security Layer
        │   │   ├── SecurityConfig.java
        │   │   ├── JwtAuthenticationFilter.java
        │   │   └── JwtUtil.java
        │   ├── config/          # Utility Layer
        │   │   └── SwaggerConfig.java
        │   ├── api/             # View Layer
        │   │   └── ProtectedController.java
        │   ├── user/            # Data Access Layer
        │   │   ├── AppUser.java          # Entity
        │   │   └── AppUserRepository.java # Repository
        │   ├── task/            # Data Access Layer
        │   └── alert/           # Data Access Layer
        └── api/                 # View Layer
            └── HealthController.java
```

## Tecnologías Frontend

- **Next.js 15.5.6**: Framework React
- **React 19.1.0**: Biblioteca UI
- **TailwindCSS 4**: Estilos utility-first
- **localStorage**: Persistencia de sesión

## Conclusión

La arquitectura sigue el patrón de capas especificado en el diagrama UML, separando responsabilidades claramente:
- **Frontend**: View → ViewModel → Model → Utility
- **Backend**: View → Logic → Data Access con Security y Utility (Swagger)

Esta estructura facilita el mantenimiento, testing y escalabilidad del proyecto.


