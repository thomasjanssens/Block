# -*- coding: utf-8 -*-

from sklearn.ensemble import RandomForestClassifier as rfc
from sklearn.ensemble import RandomForestRegressor as rfr
from sklearn.cross_validation import cross_val_score
import numpy as np
import random as rand
import math


def generateMockUserData(umin, umax):
    # features
    userID = rand.randint(umin, umax)
    state = rand.getstate()
    rand.seed(userID)
    user_peak_hour = rand.randint(8, 18)
    rand.setstate(state)
    hour = rand.randint(0, 24 - 1)
    weekday = rand.randint(0, 4)

    # noise factors
    eta_hour = 0  # math.floor(.5+rand.gauss(0,.3))
    eta_weekday = 0  # math.floor(.5+rand.gauss(0,.3))

    # mood gets worse from peak hour
    h = math.fabs(user_peak_hour - (hour + eta_hour)) / 24
    # wednesday is peak
    wd = math.fabs(weekday + eta_weekday - 2)

    # generate class, mood in "stars"
    mood = math.floor(h + wd)
    return np.array([userID, hour, weekday, mood, user_peak_hour])


def createMoodTestModel(train, test):
    forest = rfc()
    forest.fit(np.delete(train, -2, 1), train[:, -2])
    scores = cross_val_score(forest, np.delete(test, -2, 1), test[:, -2])
    print test.shape
    print train.shape
    print scores.mean()


def createPeakTestModel(train, test):
    forest = rfr()
    forest.fit(train[:, :-1], train[:, -1])
    scores = cross_val_score(forest, test[:, :-1], test[:, -1])
    print test.shape
    print train.shape
    print scores.mean()
    for x in xrange(test.shape[0]):
        print "%i vs %i given %s" % (test[x, -1], forest.predict(test[x, :-1].reshape(1, -1)), test[x, :-1])


def main():
    n_train = 100
    n_test = 10
    train = generateMockUserData(0, 10)
    test = generateMockUserData(11, 21)
    for x in xrange(n_train - 1):
        train = np.vstack([train, generateMockUserData(0, 10)])
    for x in xrange(n_test - 1):
        test = np.vstack([test, generateMockUserData(11, 21)])
    print train
    createMoodTestModel(train, test)
    createPeakTestModel(train, test)


if __name__ == "__main__":
    main()