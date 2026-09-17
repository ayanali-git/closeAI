-- Allow authenticated users to delete messages from their own chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Users can delete messages from own chats'
  ) THEN
    CREATE POLICY "Users can delete messages from own chats"
      ON messages
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM chats
          WHERE chats.id = messages.chat_id
          AND chats.user_id = auth.uid()
        )
      );
  END IF;
END $$;
