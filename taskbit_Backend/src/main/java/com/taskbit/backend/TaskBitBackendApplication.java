package com.taskbit.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.taskbit.backend", "auth", "user", "com.taskbit"})
@EnableJpaRepositories(basePackages = {"com.taskbit.backend", "user"})
@EntityScan(basePackages = {"com.taskbit.backend", "user"})
public class TaskBitBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskBitBackendApplication.class, args);
    }

}

