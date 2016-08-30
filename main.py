from datetime import datetime

from flask import Flask, render_template, request
from flask_login import LoginManager, login_required, logout_user
from flask_login import login_user
from flask_login import current_user
from flask import redirect
import flask
import time
import modeling
import re

from LoginForm import LoginForm
from User import User
from database import Database

app = Flask(__name__)

app.config['COUCHDB_SERVER'] = "http://localhost:5984/"
app.config['COUCHDB_DATABASE'] = "active_server_cp"
db = Database(app)

#db.one_time_update_func()

login_manager = LoginManager()
login_manager.init_app(app)
form = LoginForm()

app.secret_key = "\x93S\x1f\x88\x9f\xd7\x12\x88\xa8x^\x1b\x07\xc1'\xea\x97\xac\x037T\xebA\x05"


@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    print request.form
    if request.method == 'GET':
        return render_template('app_screen.html')
    else:  # post
        task = hash(request.form['taskName'])
        energy = int(request.form['energy'])
        curr_time = int(time.strftime('%H'))+float(time.strftime('%M'))/60
        weekday = int(time.strftime('%w'))
        if(not task):
            return '0'
        pred_time_mins = modeling.get_prediction_for_user(current_user,energy,task,curr_time,weekday)
        return int(pred_time_mins).__str__()



@app.route('/favorites')
@login_required
def favorites():
    return flask.jsonify(favorites=current_user.get_favorites())

@app.route('/get_version')
@login_required
def get_version():
    import os
    print type(os.path.dirname)
    d = os.path.dirname(__file__)
    filename = d +'/static/bundle.js'
    t = os.path.getmtime(filename)
    print "version request, passing %s" % str(int(t))
    return str(int(t))


@app.route('/finish_sprint', methods=['GET', 'POST'])
@login_required
def finish_sprint():
    print request.form
    task_name = request.form['task_name']
    pre_energy = request.form['pre_energy']
    start_time = datetime.fromtimestamp(float(request.form['start_time'])/1000)
    end_time = datetime.fromtimestamp(float(request.form['end_time'])/1000)
    user_rating = request.form['user_rating']
    auto_rating = request.form['auto_rating']
    suggested_time = request.form['suggested_time']

    print "user %s finished block of length %ss" % (current_user.name, (end_time-start_time).total_seconds())
    db.store_finished_sprint(current_user,task_name,pre_energy,start_time,end_time,user_rating,auto_rating,suggested_time)
    return '', 204

@app.route('/finish_break', methods=['GET', 'POST'])
@login_required
def finish_break():
    print request.form
    break_start_time = datetime.fromtimestamp(float(request.form['break_start_time'])/1000)
    break_end_time = datetime.fromtimestamp(float(request.form['break_end_time'])/1000)
    print "user %s finished break of length %ss" % (current_user.name, (break_end_time-break_start_time).total_seconds())
    db.store_finished_break(current_user,break_start_time,break_end_time)
    return '', 204

@login_manager.user_loader
def get_user(ident):
    return db.get_user(ident)


def next_is_valid(next):
    print next
    return True

@app.route('/get_block_stats')
@login_required
def get_block_stats():
    return flask.jsonify(current_user.dataInstances.list)

@app.route('/get_break_stats')
@login_required
def get_break_stats():
    return flask.jsonify([{'start_time':b['break_start_time'],'end_time':b['break_end_time']} for b in current_user.breakInstances.list])


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Here we use a class of some kind to represent and validate our
    # client-side form data. For example, WTForms is a library that will
    # handle this for us, and we use a custom LoginForm to validate.
    form_in = LoginForm(request.form)
    print form_in.data
    username = form_in.data.get('username')
    password = form_in.data.get('password')
    print form_in.validate()
    if form_in.validate():
        # Login and validate the user.
        # user should be an instance of your `User` class
        user = get_user(username)
        pass_ok = False
        if(user == None):
            user = db.create_user(username,password)
            pass_ok = True
        else:
            pass_ok = db.check_user_password(username, password)

        if(pass_ok):
            login_user(user)
            next_url = flask.request.args.get('next')
            # next_is_valid should check if the user has valid
            # permission to access the `next` url
            if not next_is_valid(next_url):
                return flask.abort(400)

            return flask.redirect(next_url or flask.url_for('index'))
    return flask.render_template('login_screen.html', form=form)


@login_manager.unauthorized_handler
def unauthorized():
    # do stuff
    return redirect(flask.url_for('login'))


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect("/login")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Development Server Help')
    parser.add_argument("-d", "--debug", action="store_true", dest="debug_mode",
                        help="run in debug mode (for use with PyCharm)", default=False)
    parser.add_argument("-p", "--port", dest="port",
                        help="port of server (default:%(default)s)", type=int, default=5000)

    cmd_args = parser.parse_args()
    app_options = {"port": cmd_args.port}

    if cmd_args.debug_mode:
        app_options["debug"] = True
        app_options["use_debugger"] = False
        app_options["use_reloader"] = False

    app.run(**app_options)
# @app.route('/', methods=['GET','POST'])
# def prototype_output():
#     print request.form
#     if request.method == 'POST':
#         if 'add' in request.form:
#             db.put_task(request.form['task_name'])
#         elif 'del' in request.form:
#             db.clear()
#         else:
#             [db.remove(x) for x in request.form]
#         return redirect(url_for('prototype_output'))
#     else:
#         task_list = db.get_tasks()
#         return render_template('prototype.html', task_list = task_list, a_variable=len(task_list))
