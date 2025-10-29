-- Migration: Add Header and Footer sections to required_sections question
-- Date: 2025-10-29
-- Description: Adds Header and Footer as essential landing page sections

-- Insert Header section at the beginning (sort_order 0)
INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  id,
  'Header (Logo, Navigation)',
  0,
  strftime('%s', 'now')
FROM questions
WHERE question_key = 'required_sections'
  AND service_id = (SELECT id FROM service_types WHERE name = 'Landing Page')
LIMIT 1;

-- Update existing options to shift sort_order by 1
UPDATE question_options
SET sort_order = sort_order + 1
WHERE question_id = (
  SELECT id FROM questions
  WHERE question_key = 'required_sections'
    AND service_id = (SELECT id FROM service_types WHERE name = 'Landing Page')
  LIMIT 1
)
AND option_value != 'Header (Logo, Navigation)';

-- Insert Footer section at the end
INSERT INTO question_options (question_id, option_value, sort_order, created_at)
SELECT
  id,
  'Footer (Copyright, Links)',
  11,
  strftime('%s', 'now')
FROM questions
WHERE question_key = 'required_sections'
  AND service_id = (SELECT id FROM service_types WHERE name = 'Landing Page')
LIMIT 1;
