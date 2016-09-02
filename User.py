from couchdb.mapping import Document, IntegerField, TextField, ListField, Mapping, DictField, DateTimeField, \
    ViewField, BooleanField


class User(Document):
    name = TextField()
    password = TextField()
    exclusions = ListField(TextField())
    dataInstances = ListField(DictField(Mapping.build(
        task_name=TextField(),
        start_time=DateTimeField(),
        end_time=DateTimeField(),
        suggested_time=IntegerField(),
        pre_energy=IntegerField(),
        user_feedback=IntegerField(),
        auto_rating=BooleanField()
    )))
    breakInstances = ListField(DictField(Mapping.build(
        break_start_time=DateTimeField(),
        break_end_time=DateTimeField()
    )))

    usernameView = ViewField('users', '''\
         function(doc) {
             emit(doc.name, doc);
         }''')

    def get_favorites(self):
        favs = []
        for inst in self.dataInstances:
            if inst.task_name not in favs and inst.task_name not in self.exclusions:
                favs.append(inst.task_name)
        return favs


    @property
    def is_active(self):
        return True

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.name)
