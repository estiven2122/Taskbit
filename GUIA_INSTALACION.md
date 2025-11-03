# Guía de Instalación y Ejecución - TaskBit

Esta guía te ayudará a instalar y ejecutar el proyecto TaskBit siguiendo la arquitectura especificada.

## Requisitos Previos

### Backend (Spring Boot)
- **Java 21** o superior
- **Maven 3.8+**
- **PostgreSQL 12+** (en ejecución)

### Frontend (Next.js)
- **Node.js 18+**
- **npm** o **yarn**

## Instalación y Configuración

### 1. Base de Datos PostgreSQL

#### Instalar PostgreSQL
Si no tienes PostgreSQL instalado:
- **Windows**: Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### Crear la Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE taskbitdb;

# Verificar que se creó
\l

# Salir
\q
```

#### Configurar Usuario y Contraseña
Si tu configuración es diferente a la del `application.properties`, actualiza:
```properties
# Taskbit/taskbit_Backend/src/main/resources/application.properties
spring.datasource.username=postgres
spring.datasource.password=admin1234
```

### 2. Backend (Spring Boot)

#### Navegar al Directorio del Backend
```bash
cd Taskbit/taskbit_Backend
```

#### Instalar Dependencias
```bash
# Maven descargará automáticamente todas las dependencias
mvn clean install
```

#### Ejecutar el Backend
```bash
# Opción 1: Usando Maven
mvn spring-boot:run

# Opción 2: Ejecutar el JAR compilado
mvn package
java -jar target/taskbit-backend-0.0.1-SNAPSHOT.jar
```

El backend se ejecutará en: **http://localhost:8080**

#### Verificar que Funciona
- **API Health**: http://localhost:8080/api/ping
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

### 3. Frontend (Next.js)

#### Navegar al Directorio del Frontend
En una nueva terminal:
```bash
cd Taskbit/taskbit
```

#### Instalar Dependencias
```bash
npm install
# o
yarn install
```

#### Ejecutar el Frontend
```bash
npm run dev
# o
yarn dev
```

El frontend se ejecutará en: **http://localhost:3000**

## Verificación de la Instalación

### 1. Verificar Backend
```bash
# En el navegador o con curl
curl http://localhost:8080/api/ping

# Deberías ver: "✅ TaskBit Backend funcionando correctamente!"
```

### 2. Verificar Swagger
Abre en el navegador: http://localhost:8080/swagger-ui.html

Deberías ver la documentación de la API con:
- Endpoints de autenticación (`/api/auth/login`, `/api/auth/register`)
- Documentación de requests y responses

### 3. Verificar Frontend
Abre en el navegador: http://localhost:3000

Deberías ver:
- Página de inicio con formulario de registro
- Enlace para iniciar sesión

## Uso Básico

### 1. Registrar un Usuario
1. Abre http://localhost:3000
2. Completa el formulario de registro:
   - Nombre
   - Email
   - Contraseña (mínimo 8 caracteres)
3. Haz clic en "Crear cuenta"

### 2. Iniciar Sesión
1. Haz clic en "Inicia sesión aquí" o ve a http://localhost:3000/login
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"
4. Serás redirigido al dashboard

### 3. Usar Swagger para Probar la API
1. Abre http://localhost:8080/swagger-ui.html
2. Expande "Autenticación"
3. Prueba `/api/auth/register`:
   - Clic en "Try it out"
   - Completa el JSON de ejemplo
   - Clic en "Execute"
4. Prueba `/api/auth/login` con las mismas credenciales
5. Copia el token JWT retornado
6. Para usar endpoints protegidos:
   - Clic en el botón "Authorize" (🔓) arriba
   - Ingresa `Bearer <tu-token>`
   - Clic en "Authorize"

## Estructura del Proyecto

```
Taskbit/
├── ARQUITECTURA.md           # Documentación de arquitectura
├── GUIA_INSTALACION.md       # Este archivo
├── taskbit/                  # Frontend Next.js
│   └── src/
│       ├── app/              # Páginas (View Layer)
│       ├── components/       # Componentes (Utility Layer)
│       ├── context/          # Context de React (ViewModel Layer)
│       └── services/         # Servicios (Model Layer)
│
└── taskbit_Backend/          # Backend Spring Boot
    └── src/main/java/
        ├── auth/             # Feature de autenticación
        │   ├── controller/   # View Layer
        │   ├── service/      # Logic Layer
        │   └── dto/          # Data Transfer Objects
        └── com/taskbit/backend/
            ├── security/     # Security Layer
            ├── config/       # Utility Layer (Swagger)
            ├── user/         # Data Access Layer (User)
            ├── task/         # Data Access Layer (Task)
            └── alert/        # Data Access Layer (Alert)
```

## Solución de Problemas Comunes

### Error: "Connection refused" al conectar con PostgreSQL
**Causa**: PostgreSQL no está en ejecución o la configuración es incorrecta.

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
# Windows
netstat -an | findstr 5432

# Mac/Linux
sudo lsof -i :5432

# Si no está corriendo, iniciarlo:
# Windows: Buscar "PostgreSQL" en servicios
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Error: "Cannot find module"
**Causa**: Las dependencias no están instaladas.

**Solución**:
```bash
# Frontend
cd Taskbit/taskbit
npm install

# Backend
cd Taskbit/taskbit_Backend
mvn clean install
```

### Error: CORS al hacer requests desde el frontend
**Causa**: El backend no permite CORS desde el frontend.

**Solución**: Ya está configurado en `SecurityConfig.java`:
```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
```

Si usas un puerto diferente, actualiza la configuración.

### Error: "Port 8080 already in use"
**Causa**: Otro proceso está usando el puerto 8080.

**Solución**:
```bash
# Encontrar el proceso
# Windows
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :8080

# Matar el proceso o cambiar el puerto en application.properties:
server.port=8081
```

### Error: "token is invalid" en Swagger
**Causa**: El token JWT expiró o es inválido.

**Solución**: Genera un nuevo token:
1. Haz login nuevamente con `/api/auth/login`
2. Copia el token
3. Usa el botón "Authorize" en Swagger
4. Ingresa: `Bearer <nuevo-token>`

## Configuración Adicional

### Cambiar el Puerto del Backend
Edita `Taskbit/taskbit_Backend/src/main/resources/application.properties`:
```properties
server.port=8081
```

Y actualiza las URLs en el frontend:
- `Taskbit/taskbit/src/app/api/login/route.js`
- `Taskbit/taskbit/src/app/api/register/route.js`

### Configurar Variables de Entorno (Producción)

Para producción, usa variables de entorno en lugar de valores hardcodeados:

**Backend** (`application.properties` o `application.yml`):
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
jwt:
  secret: ${JWT_SECRET}
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Testing

### Probar la API con curl
```bash
# Registrar usuario
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Endpoint protegido (usar el token de la respuesta anterior)
curl -X GET http://localhost:8080/api/protected \
  -H "Authorization: Bearer <tu-token>"
```

## Próximos Pasos

1. Leer `ARQUITECTURA.md` para entender la estructura del proyecto
2. Explorar Swagger UI para ver todos los endpoints disponibles
3. Probar crear, editar y eliminar tareas (cuando estén implementados)
4. Configurar alertas (cuando estén implementadas)

## Soporte

Para más información:
- Ver `ARQUITECTURA.md` para detalles de la arquitectura
- Ver la documentación de Swagger en http://localhost:8080/swagger-ui.html
- Revisar los logs del backend en la consola

---

**¡Listo!** Tu proyecto TaskBit debería estar funcionando correctamente siguiendo la arquitectura especificada. 🎉


