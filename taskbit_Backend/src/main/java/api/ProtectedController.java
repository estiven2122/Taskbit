package api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
public class ProtectedController {

    @GetMapping("/api/protected")
    public String protectedEndpoint(Principal principal) {
        String name = (principal != null) ? principal.getName() : "anonymous";
        return "Acceso concedido a: " + name;
    }
}
