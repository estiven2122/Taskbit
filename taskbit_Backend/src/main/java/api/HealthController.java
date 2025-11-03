package api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import java.util.List;

@RestController
@Tag(name = "Health Check", description = "Endpoints de verificación de salud del sistema")
public class HealthController {

    @Autowired
    private EntityManager entityManager;

    @GetMapping("/api/ping")
    @Operation(summary = "Verificar salud del backend", description = "Retorna un mensaje de confirmación de que el backend está funcionando")
    public String ping() {
        return "✅ TaskBit Backend funcionando correctamente!";
    }

    @GetMapping("/api/users")
    @Operation(summary = "Listar usuarios", description = "Obtiene la lista de todos los usuarios registrados")
    public List<?> getUsers() {
        Query query = entityManager.createNativeQuery("SELECT id, name, email FROM app_user");
        return query.getResultList();
    }
}
