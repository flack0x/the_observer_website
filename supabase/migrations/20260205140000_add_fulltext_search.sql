-- Full-text search: add tsvector column with weighted fields
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Backfill existing articles (English = 'english' config with stemming, Arabic = 'simple')
UPDATE articles SET search_vector =
  setweight(to_tsvector(
    CASE WHEN channel = 'ar' THEN 'simple'::regconfig ELSE 'english'::regconfig END,
    coalesce(title, '')), 'A') ||
  setweight(to_tsvector(
    CASE WHEN channel = 'ar' THEN 'simple'::regconfig ELSE 'english'::regconfig END,
    coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector(
    CASE WHEN channel = 'ar' THEN 'simple'::regconfig ELSE 'english'::regconfig END,
    coalesce(content, '')), 'C');

-- GIN index for fast full-text search
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Auto-update trigger: keeps search_vector in sync on insert/update
CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
DECLARE
  cfg regconfig;
BEGIN
  cfg := CASE WHEN NEW.channel = 'ar' THEN 'simple'::regconfig ELSE 'english'::regconfig END;
  NEW.search_vector :=
    setweight(to_tsvector(cfg, coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector(cfg, coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector(cfg, coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION articles_search_vector_update();
