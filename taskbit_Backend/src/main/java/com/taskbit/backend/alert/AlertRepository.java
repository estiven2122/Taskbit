package com.taskbit.backend.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByTaskId(Long taskId);
    List<Alert> findByTaskIdAndStatus(Long taskId, String status);
    Optional<Alert> findByTaskIdAndTimeBefore(Long taskId, String timeBefore);
    List<Alert> findByStatus(String status);
}