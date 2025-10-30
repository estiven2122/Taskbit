package auth.controller;

import auth.dto.AuthResponse;
import auth.dto.LoginRequest;
import auth.dto.RegisterRequest;
import auth.service.UserService;
import com.taskbit.backend.security.JwtUtil;
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
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AppUser user = userService.registerUser(request);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Usuario registrado exitosamente")
                .userId(user.getId())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userService.authenticate(request.getEmail(), request.getPassword());
    String token = jwtUtil.generateToken(user.getId(), user.getEmail());

    return ResponseEntity.ok(AuthResponse.builder()
        .message("Inicio de sesión exitoso")
        .userId(user.getId())
        .token(token)
        .build());
    }
}