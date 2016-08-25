from wtforms import Form, StringField, PasswordField
from wtforms import validators


class LoginForm(Form):
    username = StringField('Username',[validators.InputRequired()])
    password = PasswordField('Password',[validators.InputRequired()])
