package api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import java.util.List;

@RestController
public class HealthController {

    @Autowired
    private EntityManager entityManager;

    @GetMapping("/api/ping")
    public String ping() {
        return "✅ TaskBit Backend funcionando correctamente!";
    }

    @GetMapping("/api/users")
    public List<?> getUsers() {
        Query query = entityManager.createNativeQuery("SELECT id, name, email FROM app_user");
        return query.getResultList();
    }
}
