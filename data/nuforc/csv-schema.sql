
-- set env var INPUT_CSV to kaggle_limited.csv etc

DROP TABLE IF EXISTS sightings;
CREATE TABLE sightings (
    date_time TEXT, 
    city_area VARCHAR(100),
    state VARCHAR(100),
    country TEXT,
    ufo_shape VARCHAR(25),
    encounter_length TEXT,
    described_encounter_length TEXT,
    description TEXT,
    date_documented TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

