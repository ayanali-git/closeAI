-- Migration: Add archived column to chats table
ALTER TABLE chats ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
