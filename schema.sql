-- ProTactics API: PostgreSQL schema (PostgreSQL 12+).
-- Reconstructed from every query in the codebase.
--
-- Fresh database:
--   createdb protactics
--   psql -d protactics -f schema.sql
--   psql -d protactics -f seed.sql      (optional demo data)
--
-- The script runs in one transaction and fails if the tables already exist;
-- it never drops anything.

BEGIN;

-- Clubs: one of the two account types.
CREATE TABLE clubs (
    club_id    SERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    correo     VARCHAR(254) NOT NULL,
    password   VARCHAR(100) NOT NULL,              -- bcrypt hash
    ubicacion  VARCHAR(150),
    foto_url   TEXT,
    creado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX clubs_correo_key ON clubs (LOWER(correo));

-- Coaches: the other account type; every coach belongs to a club.
CREATE TABLE entrenadores (
    entrenador_id SERIAL PRIMARY KEY,
    club_id       INTEGER      NOT NULL REFERENCES clubs (club_id) ON DELETE CASCADE,
    nombre        VARCHAR(100) NOT NULL,
    correo        VARCHAR(254) NOT NULL,
    password      VARCHAR(100) NOT NULL,           -- bcrypt hash
    equipo        VARCHAR(100),                    -- free-text team label
    telefono      VARCHAR(30),
    foto_url      TEXT,
    notas         TEXT,
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX entrenadores_correo_key ON entrenadores (LOWER(correo));
CREATE INDEX entrenadores_club_id_idx ON entrenadores (club_id);

-- Teams of a club, optionally assigned to one of its coaches.
CREATE TABLE equipos (
    equipo_id     SERIAL PRIMARY KEY,
    club_id       INTEGER      NOT NULL REFERENCES clubs (club_id) ON DELETE CASCADE,
    entrenador_id INTEGER      REFERENCES entrenadores (entrenador_id) ON DELETE SET NULL,
    nombre        VARCHAR(100) NOT NULL,
    categoria     VARCHAR(50)  NOT NULL,            -- Benjamín, Alevín, Infantil...
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX equipos_club_id_idx ON equipos (club_id);
CREATE INDEX equipos_entrenador_id_idx ON equipos (entrenador_id);

-- Players. They keep existing if their team or coach is deleted.
CREATE TABLE jugadores (
    jugador_id    SERIAL PRIMARY KEY,
    equipo_id     INTEGER      REFERENCES equipos (equipo_id) ON DELETE SET NULL,
    entrenador_id INTEGER      REFERENCES entrenadores (entrenador_id) ON DELETE SET NULL,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    dorsal        SMALLINT     NOT NULL CHECK (dorsal BETWEEN 0 AND 99),
    posicion      VARCHAR(50)  NOT NULL,            -- Portero, Defensa, Mediocentro, Delantero
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX jugadores_equipo_id_idx ON jugadores (equipo_id);
CREATE INDEX jugadores_entrenador_dorsal_idx ON jugadores (entrenador_id, dorsal);

-- Training sessions designed by a coach.
CREATE TABLE entrenamientos (
    entrenamiento_id    SERIAL PRIMARY KEY,
    entrenador_id       INTEGER      NOT NULL REFERENCES entrenadores (entrenador_id) ON DELETE CASCADE,
    titulo              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    categoria           VARCHAR(50),               -- tecnica, fisica, tactica...
    campo               VARCHAR(100),
    fecha_entrenamiento DATE,
    duracion_repeticion INTERVAL,
    repeticiones        INTEGER      CHECK (repeticiones >= 0),
    descanso            INTEGER      CHECK (descanso >= 0),     -- minutes between repetitions
    total_duracion      INTERVAL GENERATED ALWAYS AS (
                            duracion_repeticion * repeticiones
                            + make_interval(mins => COALESCE(descanso, 0) * GREATEST(repeticiones - 1, 0))
                        ) STORED,
    valoracion          SMALLINT     CHECK (valoracion BETWEEN 0 AND 5),
    imagen_url          TEXT,
    notas               TEXT,
    creado_en           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX entrenamientos_entrenador_id_idx ON entrenamientos (entrenador_id);

-- Players taking part in a session.
CREATE TABLE entrenamiento_jugadores (
    entrenamiento_id INTEGER NOT NULL REFERENCES entrenamientos (entrenamiento_id) ON DELETE CASCADE,
    jugador_id       INTEGER NOT NULL REFERENCES jugadores (jugador_id) ON DELETE CASCADE,
    PRIMARY KEY (entrenamiento_id, jugador_id)
);
CREATE INDEX entrenamiento_jugadores_jugador_id_idx ON entrenamiento_jugadores (jugador_id);

-- Posts shared by coaches; usually a published copy of a session.
CREATE TABLE publicaciones (
    publicacion_id      SERIAL PRIMARY KEY,
    entrenador_id       INTEGER      NOT NULL REFERENCES entrenadores (entrenador_id) ON DELETE CASCADE,
    entrenamiento_id    INTEGER      REFERENCES entrenamientos (entrenamiento_id) ON DELETE SET NULL,
    titulo              VARCHAR(150) NOT NULL,
    contenido           TEXT         NOT NULL,
    imagen_url          TEXT         DEFAULT 'default.png',
    categoria           VARCHAR(50),
    campo               VARCHAR(100),
    fecha_entrenamiento DATE,
    duracion_repeticion INTERVAL,
    repeticiones        INTEGER      CHECK (repeticiones >= 0),
    total_duracion      INTERVAL,
    descanso            INTEGER      CHECK (descanso >= 0),
    notas_adicionales   TEXT,
    creado_en           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX publicaciones_entrenador_id_idx ON publicaciones (entrenador_id);
CREATE INDEX publicaciones_creado_en_idx ON publicaciones (creado_en DESC);

-- One like per coach and post.
CREATE TABLE likes (
    entrenador_id  INTEGER     NOT NULL REFERENCES entrenadores (entrenador_id) ON DELETE CASCADE,
    publicacion_id INTEGER     NOT NULL REFERENCES publicaciones (publicacion_id) ON DELETE CASCADE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (entrenador_id, publicacion_id)
);
CREATE INDEX likes_publicacion_id_idx ON likes (publicacion_id);

-- Coaches following other coaches (used by the activity summary).
CREATE TABLE seguidores (
    seguidor_id INTEGER     NOT NULL REFERENCES entrenadores (entrenador_id) ON DELETE CASCADE,
    seguido_id  INTEGER     NOT NULL REFERENCES entrenadores (entrenador_id) ON DELETE CASCADE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (seguidor_id, seguido_id),
    CHECK (seguidor_id <> seguido_id)
);
CREATE INDEX seguidores_seguido_id_idx ON seguidores (seguido_id);

COMMIT;
