-- Migration: Add proposal column to projects table
-- This column stores the AI-generated project proposal draft

ALTER TABLE projects ADD COLUMN proposal text;
