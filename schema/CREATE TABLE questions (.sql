CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    question_key VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    type ENUM('select', 'checkbox', 'text') NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    placeholder VARCHAR(255),
    
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE (service_id, question_key) -- Ensures question_key is unique per service
);