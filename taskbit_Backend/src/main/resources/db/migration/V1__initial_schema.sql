CREATE TABLE IF NOT EXISTS app_user (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS task (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    priority VARCHAR(10),
    course VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS alert (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES task(id),
    time_before VARCHAR NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'activa',
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT ux_alert_nodup UNIQUE (task_id, time_before)
);