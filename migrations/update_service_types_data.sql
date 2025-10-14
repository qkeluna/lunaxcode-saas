-- Update existing service_types with timeline and popular values

-- Landing Page (id: 1) - Popular, Quick turnaround
UPDATE service_types SET timeline = '1-2 weeks', popular = TRUE WHERE id = 1;

-- Business Website (id: 2) - Popular, Medium timeline
UPDATE service_types SET timeline = '2-4 weeks', popular = TRUE WHERE id = 2;

-- E-Commerce Website (id: 3) - Not marked as popular, Longer timeline
UPDATE service_types SET timeline = '4-8 weeks', popular = FALSE WHERE id = 3;

-- Web Application (id: 4) - Popular, Extended timeline
UPDATE service_types SET timeline = '6-12 weeks', popular = TRUE WHERE id = 4;

-- Mobile App Development (id: 5) - Not marked as popular, Longest timeline
UPDATE service_types SET timeline = '8-16 weeks', popular = FALSE WHERE id = 5;
