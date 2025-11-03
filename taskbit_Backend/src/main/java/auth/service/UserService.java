package auth.service;

import com.taskbit.backend.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taskbit.backend.user.AppUser;
import com.taskbit.backend.user.AppUserRepository;
import com.taskbit.backend.user.PasswordResetToken;
import com.taskbit.backend.user.PasswordResetTokenRepository;
import auth.dto.RegisterRequest;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    
    // Duración del token de reset (24 horas)
    private static final int TOKEN_EXPIRATION_HOURS = 24;

    @Transactional
    public AppUser registerUser(RegisterRequest request) {
        // Verificar si el email ya existe
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AuthenticationException("El email ya está registrado");
        }

        // Crear nuevo usuario
        AppUser newUser = AppUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .createdAt(OffsetDateTime.now())
                .build();

        return userRepository.save(newUser);
    }

    @Transactional(readOnly = true)
    public AppUser authenticate(String email, String password) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Usuario no registrado"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationException("Contraseña inválida");
        }

        if (!user.isEnabled()) {
            throw new AuthenticationException("La cuenta está deshabilitada");
        }

        return user;
    }

    @Transactional
    public String initiatePasswordReset(String email) {
        // Verificar si el usuario existe
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Usuario no registrado"));

        // Invalidar tokens previos del usuario (marcar como usados)
        List<PasswordResetToken> existingTokens = passwordResetTokenRepository.findByUserIdAndUsedFalse(user.getId());
        for (PasswordResetToken token : existingTokens) {
            token.setUsed(true);
            passwordResetTokenRepository.save(token);
        }

        // Generar nuevo token
        String tokenValue = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(expiresAt)
                .used(false)
                .createdAt(OffsetDateTime.now())
                .build();

        passwordResetTokenRepository.save(resetToken);

        // En producción, aquí se enviaría un email con el enlace
        // Por ahora, retornamos el token para pruebas
        return tokenValue;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Validar políticas de contraseña
        if (newPassword.length() < 8) {
            throw new AuthenticationException("Contraseña insegura");
        }

        boolean hasUpperCase = newPassword.chars().anyMatch(Character::isUpperCase);
        boolean hasNumber = newPassword.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = newPassword.chars()
                .anyMatch(ch -> "!@#$%^&*(),.?\":{}|<>".indexOf(ch) >= 0);

        if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
            throw new AuthenticationException("Contraseña insegura");
        }

        // Buscar token válido
        OffsetDateTime now = OffsetDateTime.now();
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalseAndExpiresAtAfter(token, now)
                .orElseThrow(() -> new AuthenticationException("Token inválido o expirado"));

        // Actualizar contraseña del usuario
        AppUser user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Marcar token como usado
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}