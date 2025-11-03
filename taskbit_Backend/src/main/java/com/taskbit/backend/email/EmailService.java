package com.taskbit.backend.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    private static final String FROM_EMAIL = "lopezcristian7560@gmail.com";
    private static final String RESET_PASSWORD_SUBJECT = "Recuperación de Contraseña - TaskBit";
    
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
            
            String messageBody = String.format(
                "Hola,\n\n" +
                "Has solicitado restablecer tu contraseña en TaskBit.\n\n" +
                "Para restablecer tu contraseña, haz clic en el siguiente enlace:\n" +
                "%s\n\n" +
                "Este enlace expirará en 24 horas.\n\n" +
                "Si no solicitaste este cambio, puedes ignorar este correo.\n\n" +
                "Saludos,\n" +
                "Equipo TaskBit",
                resetLink
            );
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject(RESET_PASSWORD_SUBJECT);
            message.setText(messageBody);
            
            mailSender.send(message);
            log.info("Email de recuperación de contraseña enviado exitosamente a: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Error al enviar email de recuperación de contraseña a: {}", toEmail, e);
            throw new RuntimeException("Error al enviar el correo de recuperación de contraseña", e);
        }
    }
}

