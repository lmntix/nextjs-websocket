-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to notify on todo changes
CREATE OR REPLACE FUNCTION notify_todo_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('todo_changes', json_build_object(
    'operation', TG_OP,
    'record', row_to_json(COALESCE(NEW, OLD))
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for real-time notifications
CREATE TRIGGER todo_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION notify_todo_change();
