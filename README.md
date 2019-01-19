# What is this?

`electrosnake` is an attempt of an Electron App that is backed by Python.
The idea is that the "frontend" is developed in [Typescript](https://www.typescriptlang.org) 
and the backend is written in [Python](https://www.python.org) using 
[Flask](http://flask.pocoo.org).

Currently, frontend and backend communicate via HTTP over a local
network port. Yet, no authentication and validation is done. _This will
most likely change in future!_

## High-level goals of this project

This project is intended as a prototype to gain experience. Questions
that should be answered include:

* Is comunicating over a port any good? Or would socket/named pipe better?
* How to to authentication? How much authentication/validation is needed to
  make FE/BE communication safe?
* What exactly does safe mean in this context of a local app?
* How do you properly test Typescript apps?
* Is Typescript really that good?

# Prerequisites and setup

Install required Python packages using `conda`.

```
conda install doit
conda install flask
```

# Basic operation

Run the app.

```
doit start:app
```