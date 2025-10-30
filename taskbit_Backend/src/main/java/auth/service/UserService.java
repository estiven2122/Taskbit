package auth.service;

import com.taskbit.backend.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taskbit.backend.user.AppUser;
import com.taskbit.backend.user.AppUserRepository;
import auth.dto.RegisterRequest;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                .orElseThrow(() -> new AuthenticationException("El email o la contraseña son incorrectos"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationException("El email o la contraseña son incorrectos");
        }

        if (!user.isEnabled()) {
            throw new AuthenticationException("La cuenta está deshabilitada");
        }

        return user;
    }
}