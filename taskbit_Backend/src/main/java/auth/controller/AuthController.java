package auth.controller;

import auth.dto.AuthResponse;
import auth.dto.ForgotPasswordRequest;
import auth.dto.LoginRequest;
import auth.dto.RegisterRequest;
import auth.dto.ResetPasswordRequest;
import auth.service.UserService;
import com.taskbit.backend.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.taskbit.backend.user.AppUser;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para registro y login de usuarios")
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta de usuario")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AppUser user = userService.registerUser(request);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Usuario registrado exitosamente")
                .userId(user.getId())
                .build());
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y retorna un token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userService.authenticate(request.getEmail(), request.getPassword());
    String token = jwtUtil.generateToken(user.getId(), user.getEmail());

    return ResponseEntity.ok(AuthResponse.builder()
        .message("Inicio de sesión exitoso")
        .userId(user.getId())
        .token(token)
        .build());
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar restablecimiento de contraseña", description = "Envía un enlace para restablecer la contraseña al correo del usuario")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.initiatePasswordReset(request.getEmail());
        
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico")
                .build());
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Restablece la contraseña usando el token de recuperación")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getPassword());
        
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Contraseña actualizada con éxito")
                .build());
    }
}