package com.taskbit.backend;

import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class PostgresConnectionIT {

    @Test
    void connectsToPostgresAndReturnsVersion() throws Exception {
        String url = "jdbc:postgresql://localhost:5432/taskbitdb";
        String user = "postgres";
        String pass = "admin1234";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            assertNotNull(conn);
            try (Statement st = conn.createStatement()) {
                try (ResultSet rs = st.executeQuery("SELECT version()")) {
                    if (rs.next()) {
                        String version = rs.getString(1);
                        assertNotNull(version);
                        System.out.println("Postgres version: " + version);
                    }
                }
            }
        }
    }
}
