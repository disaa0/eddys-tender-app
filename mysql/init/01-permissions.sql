-- Otorgar permisos al usuario para crear bases de datos, gestionar usuarios y crear índices
GRANT CREATE, ALTER, DROP, REFERENCES, INDEX ON *.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON `eddys-tender-db`.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON `eddys-tender-db\_%`.* TO 'user'@'%';
FLUSH PRIVILEGES;