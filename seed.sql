-- ProTactics API: demo data for a fresh database created with schema.sql.
--   psql -d protactics -f seed.sql
--
-- Fictional club "UE Riera Blava". Every demo account uses the password:
--   ProTactics2026
--
--   club@rierablava.example          club
--   marta.soler@rierablava.example   coach, Benjamín A
--   pau.ferrer@rierablava.example    coach, Alevín B
--   laia.vidal@rierablava.example    coach (assistant)

BEGIN;

INSERT INTO clubs (club_id, nombre, correo, password, ubicacion, creado_en) VALUES
    (1, 'UE Riera Blava', 'club@rierablava.example',
     '$2a$10$JRTK5gH4PriKqHFfRgybPeCr4bta3JBfhsT7MWjhJAC9a.e/FqwzS',
     'Granollers, Barcelona', '2026-08-25 10:00:00+02');

INSERT INTO entrenadores (entrenador_id, club_id, nombre, correo, password, equipo, telefono, notas, creado_en) VALUES
    (1, 1, 'Marta Soler Casals', 'marta.soler@rierablava.example',
     '$2a$10$UaYfsb2M6E8niYEp31e1f.emLhBccFtlde1D/L5BepKuwV22Ovcw2',
     'Benjamín A', '+34 612 384 905', 'Coordinadora de fútbol base. UEFA B.', '2026-08-26 18:30:00+02'),
    (2, 1, 'Pau Ferrer Roig', 'pau.ferrer@rierablava.example',
     '$2a$10$yCRtEQwQR9JqDju5s3wtVevbOgSqjfmeUTc2fKX9PyO3unVhZuuV.',
     'Alevín B', '+34 655 210 487', NULL, '2026-08-27 19:05:00+02'),
    (3, 1, 'Laia Vidal Pons', 'laia.vidal@rierablava.example',
     '$2a$10$w7Fa/K2gpU8Y6Fyoc5LmLOE0ALBZIbnHgRYqjbXc6vQL3IZb3ugoW',
     'Alevín B', '+34 698 731 042', 'Segunda entrenadora. Preparación física.', '2026-09-02 17:45:00+02');

INSERT INTO equipos (equipo_id, club_id, entrenador_id, nombre, categoria, creado_en) VALUES
    (1, 1, 1, 'Benjamín A', 'Benjamín', '2026-08-26 19:00:00+02'),
    (2, 1, 2, 'Alevín B', 'Alevín', '2026-08-27 19:30:00+02');

INSERT INTO jugadores (jugador_id, equipo_id, entrenador_id, nombre, apellido, dorsal, posicion) VALUES
    (1, 1, 1, 'Arnau', 'Puig Ribas', 1, 'Portero'),
    (2, 1, 1, 'Biel', 'Serra Font', 4, 'Defensa'),
    (3, 1, 1, 'Martí', 'Casas Vila', 6, 'Mediocentro'),
    (4, 1, 1, 'Jan', 'Riera Coll', 8, 'Mediocentro'),
    (5, 1, 1, 'Èric', 'Sala Prat', 9, 'Delantero'),
    (6, 1, 1, 'Nil', 'Bosch Ferrer', 7, 'Delantero'),
    (7, 2, 2, 'Hugo', 'Navarro Gil', 1, 'Portero'),
    (8, 2, 2, 'Lucas', 'Moreno Díaz', 3, 'Defensa'),
    (9, 2, 2, 'Iker', 'Romero Sanz', 5, 'Defensa'),
    (10, 2, 2, 'Pol', 'Garriga Mas', 10, 'Mediocentro'),
    (11, 2, 2, 'Àlex', 'Campos Ortega', 11, 'Delantero'),
    (12, 2, 2, 'Oriol', 'Mas Tort', 14, 'Mediocentro');

INSERT INTO entrenamientos (entrenamiento_id, entrenador_id, titulo, descripcion, categoria, campo,
                            fecha_entrenamiento, duracion_repeticion, repeticiones, descanso,
                            valoracion, notas, creado_en) VALUES
    (1, 1, 'Rondos 4x2 y transición',
     'Rondo en un cuadrado de 12x12 m. Al recuperar, los dos defensores salen jugando hacia una miniportería.',
     'tecnica', 'Campo F7 - mitad norte', '2026-09-22', '10 minutes', 4, 2, 4,
     'Bien la presión tras pérdida; falta perfilarse antes de recibir.', '2026-09-20 21:10:00+02'),
    (2, 1, 'Finalización 1x1 ante el portero',
     'Conducción desde el centro del campo y definición en 1x1. Rotación de porteros cada 3 series.',
     'psicologica', 'Campo F7 - área sur', '2026-09-29', '8 minutes', 3, 2, 5,
     NULL, '2026-09-27 20:40:00+02'),
    (3, 2, 'Salida de balón desde el portero',
     'Salida 3+portero contra 2 presionadores. Objetivo: superar la primera línea en menos de 4 pases.',
     'tactica', 'Campo F7 completo', '2026-09-24', '12 minutes', 3, 3, 4,
     'Repetir con presión alta del rival.', '2026-09-22 22:00:00+02'),
    (4, 3, 'Circuito de coordinación y velocidad',
     'Escalera de coordinación, slalom entre picas y sprint de 15 m con cambio de dirección.',
     'fisica', 'Pista auxiliar', '2026-10-01', '6 minutes', 5, 1, 3,
     NULL, '2026-09-30 18:15:00+02');

INSERT INTO entrenamiento_jugadores (entrenamiento_id, jugador_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
    (2, 1), (2, 5), (2, 6),
    (3, 7), (3, 8), (3, 9), (3, 10),
    (4, 8), (4, 9), (4, 10), (4, 11), (4, 12);

INSERT INTO publicaciones (publicacion_id, entrenador_id, entrenamiento_id, titulo, contenido, imagen_url,
                           categoria, campo, fecha_entrenamiento, duracion_repeticion, repeticiones,
                           total_duracion, descanso, notas_adicionales, creado_en) VALUES
    (1, 1, 1, 'Rondos 4x2 y transición',
     'Rondo en un cuadrado de 12x12 m. Al recuperar, los dos defensores salen jugando hacia una miniportería.',
     'default.png', 'tecnica', 'Campo F7 - mitad norte', '2026-09-22', '10 minutes', 4,
     '46 minutes', 2, 'Bien la presión tras pérdida; falta perfilarse antes de recibir.', '2026-09-23 09:15:00+02'),
    (2, 2, 3, 'Salida de balón desde el portero',
     'Salida 3+portero contra 2 presionadores. Objetivo: superar la primera línea en menos de 4 pases.',
     'default.png', 'tactica', 'Campo F7 completo', '2026-09-24', '12 minutes', 3,
     '42 minutes', 3, 'Repetir con presión alta del rival.', '2026-09-25 08:50:00+02');

INSERT INTO likes (entrenador_id, publicacion_id) VALUES
    (2, 1), (3, 1), (1, 2);

INSERT INTO seguidores (seguidor_id, seguido_id) VALUES
    (2, 1), (3, 1), (3, 2);

-- Explicit ids were used above: move the sequences past them.
SELECT setval(pg_get_serial_sequence('clubs', 'club_id'), (SELECT MAX(club_id) FROM clubs));
SELECT setval(pg_get_serial_sequence('entrenadores', 'entrenador_id'), (SELECT MAX(entrenador_id) FROM entrenadores));
SELECT setval(pg_get_serial_sequence('equipos', 'equipo_id'), (SELECT MAX(equipo_id) FROM equipos));
SELECT setval(pg_get_serial_sequence('jugadores', 'jugador_id'), (SELECT MAX(jugador_id) FROM jugadores));
SELECT setval(pg_get_serial_sequence('entrenamientos', 'entrenamiento_id'), (SELECT MAX(entrenamiento_id) FROM entrenamientos));
SELECT setval(pg_get_serial_sequence('publicaciones', 'publicacion_id'), (SELECT MAX(publicacion_id) FROM publicaciones));

COMMIT;
