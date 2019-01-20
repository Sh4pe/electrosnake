from flask import render_template, Flask
from datetime import datetime
from . import dummy

app = Flask(__name__)

@app.route('/')
def hello_world():
    time_str = str(datetime.now())
    result_value = dummy.my_dummy_function(2)
    return render_template('index.html', time=time_str, result_value=result_value)

@app.route('/readiness_probe')
def readiness_probe():
    return 'ready'