package com.taskbit.backend.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@Tag(name = "Endpoints Protegidos", description = "Endpoints que requieren autenticación JWT")
public class ProtectedController {

    @GetMapping("/api/protected")
    @Operation(summary = "Endpoint protegido", description = "Ejemplo de endpoint que requiere autenticación JWT")
    @SecurityRequirement(name = "Bearer Authentication")
    public String protectedEndpoint(Principal principal) {
        String name = (principal != null) ? principal.getName() : "anonymous";
        return "Acceso concedido a: " + name;
    }
}
