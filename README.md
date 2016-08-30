# Block
Block is smart work timer using machine learning methods to predict optimal work and break timing.

##Overview
* `main.js` contains the core of the React.js front-end logic
* `main.py` contains the main backend server code, written using Flask.
* `modelling.py` contains the machine learning code, based on the `sklearn` package.

##Requirements
The server needs an installation of Python 2.7 and the `sklearn` package. CouchDB needs to be running. The app is configured to with a database named `active_server`.

After building `package.json` with npm, the app can be tested using Flask's built-in server:
```
$ export FLASK_APP=main.py
$ flask run
```
