import uuid

from couchdb.client import Server
from flask import g
from flask import Flask
from flask.ext.couchdb import CouchDBManager
from User import User


class Database:
    manager = None
    db = None

    def __init__(self, app):
        manager = CouchDBManager()
        # ...add document types and view definitions...
        manager.setup(app)
        server = Server()
        self.db = server['active_server_cp']

    def get_tasks(self):
        map_fun = '''function(doc) {
            emit([doc.type, doc.name], doc.name);}'''
        results = self.db.query(map_fun)
        print results
        for r in results:
            print r.key, r.value
        return results

    def put_task(self, name):
        print "name: %s" % name
        if name and name.strip():
            self.db.save({'type': 'Task', 'name': name})

    def clear(self):
        s = Server()
        del s['python-tests']
        db = s.create('python-tests')

    def remove(self, uuid):
        print uuid
        self.db.delete(self.db[uuid])

    def get_user(self, user_id):
        print 'user id: %s' % str(user_id)
        map_fun = '''function(doc) {
            if(doc.name === "''' + str(user_id) + '''"){
            emit(doc.name, doc._id);}}'''
        results = self.db.query(map_fun)
        if len(results) == 0:
            print "%s not in db" % user_id
            return None
        else:
            return User.load(self.db, results.rows[0].value)

    def create_user(self, user_id, password):
        new_user = User(name=user_id, password=password)
        new_user.store(self.db)
        return new_user

    def check_user_password(self, user_id, password):
        map_fun = '''function(doc) {
                    if(doc.name === "''' + str(user_id) + '''"){
                    emit(doc.name, doc.password);}}'''
        results = self.db.query(map_fun)
        if len(results) == 0:
            print "%s not in db" % user_id
            return True
        dbpass = results.rows[0].value
        print 'db pass: %s vs input pass %s' % (dbpass, password)
        return dbpass == password

    def store_finished_sprint(self, user, task_name, pre_energy, start_time, end_time, user_rating, auto_rating, suggested_time):
        user.dataInstances.append(
            dict(task_name=task_name, pre_energy=pre_energy, start_time=start_time, end_time=end_time,
                 user_feedback=user_rating, auto_rating=auto_rating=='true', suggested_time=suggested_time))
            #dict(task_name=task_name))
        user.store(self.db)

    def store_finished_break(self, user, break_start_time,break_end_time):
        new_break = dict(break_start_time=break_start_time,break_end_time=break_end_time)
        if not user.breakInstances:
            user.breakInstances = [new_break]
        else:
            user.breakInstances.append(new_break)
        user.store(self.db)

    def one_time_update_func(self):

        e_to_st = [15, 20, 25, 35, 50]
        map_fun = '''function(doc) {
                    emit(doc.name, doc);}'''
        results = self.db.query(map_fun)
        for r in results:
                user = User.load(self.db,r.value['_id'])
                print user
                for b in user.dataInstances:
                    if(not b.suggested_time):
                        b.suggested_time = e_to_st[int(b.pre_energy)]
                        user.store(self.db)
                    print b.pre_energy
                    print "suggested %s, worked %s" % (b.suggested_time, (b.end_time-b.start_time).seconds/60)

