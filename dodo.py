from doit.action import CmdAction
import os

def task_start():
    def get_run_flask_action():
        env_copy = os.environ
        env_copy['FLASK_APP'] = 'src/electrosnake/backend.py'
        env_copy['FLASK_ENV'] = 'development'
        return CmdAction('flask run', env=env_copy)

    subtasks = [
        { 'name': 'app',
          'actions': ['npm start'],
          'verbosity': 2 
        },
        { 'name': 'flask',
          'actions': [get_run_flask_action()],
          'verbosity': 2
        }
    ]
    for subtask in subtasks:
        yield subtask