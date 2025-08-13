-- Optimize the notification function for better performance
CREATE OR REPLACE FUNCTION notify_todo_change()
RETURNS TRIGGER AS $$
DECLARE
  notification json;
BEGIN
  -- Build notification payload
  IF TG_OP = 'DELETE' THEN
    notification = json_build_object(
      'operation', TG_OP,
      'record', row_to_json(OLD)
    );
  ELSE
    notification = json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW)
    );
  END IF;

  -- Send notification
  PERFORM pg_notify('todo_changes', notification::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS todo_change_trigger ON todos;
CREATE TRIGGER todo_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION notify_todo_change();

-- Add index for better performance on queries
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
