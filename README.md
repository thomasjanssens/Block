# Block
Block is smart work timer using machine learning methods to predict optimal work and break timing. The app is written as a server-side component written in Python and Flask, and a client-side component written in ReactJS. The server code is designed to use a CouchDB instance to read and write data. Learning is done useing the `sklearn` package. For some more information on the workings, see [this blog post](https://medium.com/made-by-many-2016-london-internship/week-9-technicalities-4f8d1e29a22b#.n4pcnudo2).

Developed during my 2016 summer internship spent among the wonderful people at [Made by Many](https://madebymany.com/).

##Overview
* `main.js` contains the core of the React.js front-end logic
* `main.py` contains the main backend server code, written using Flask.
* `modelling.py` contains the machine learning code, based on the `sklearn` package.

##Requirements
The server needs an installation of Python 2.7 and the `sklearn` package. A CouchDB instance needs to be running. The app is configured to work with a database named `active_server`.

After building `package.json` with npm, the app can be tested using Flask's built-in server:
```
$ export FLASK_APP=main.py
$ flask run
```
