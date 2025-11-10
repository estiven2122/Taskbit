package com.taskbit.backend.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByTaskId(Long taskId);
    List<Alert> findByTaskIdAndStatus(Long taskId, String status);
    
    // Query personalizada para evitar problemas con el nombre de la propiedad timeBefore
    @Query("SELECT a FROM Alert a WHERE a.task.id = :taskId AND a.timeBefore = :timeBefore")
    Optional<Alert> findByTaskIdAndTimeBefore(@Param("taskId") Long taskId, @Param("timeBefore") String timeBefore);
    
    // Query para cargar la alerta con la relación Task usando JOIN FETCH
    @Query("SELECT a FROM Alert a JOIN FETCH a.task WHERE a.id = :id")
    Optional<Alert> findByIdWithTask(@Param("id") Long id);
    
    List<Alert> findByStatus(String status);
}