import numpy as np
import time

from sklearn import preprocessing
from sklearn.ensemble.forest import RandomForestClassifier as rfc
from sklearn.linear_model import LogisticRegression as log_regr
from  sklearn.neighbors import KNeighborsClassifier as knn
from random import randint

NUM_FEATURES = 5
np.set_printoptions(suppress=True, precision=3)


def get_user_data_from_db(user):
    training_data = np.zeros((len(user.dataInstances), NUM_FEATURES + 1))
    for i in xrange(len(user.dataInstances)):
        training_data[i:] = transform_db_instance(user.dataInstances[i])

    return training_data


def transform_db_instance(dataInstance):
    res = np.zeros((NUM_FEATURES + 1))
    # name
    res[0] = hash(dataInstance.task_name)
    # start time
    t = dataInstance.start_time
    res[1] = int(t.strftime('%H')) + float(t.strftime('%M')) / 60
    # duration
    # e = dataInstance.end_time
    # delta = e - t
    # res[2] = int(delta.total_seconds() / 60)
    res[2] = dataInstance.suggested_time
    # weekday
    res[3] = int(t.strftime('%w'))
    # energy
    res[4] = dataInstance.pre_energy
    # target = user rating
    res[5] = dataInstance.user_feedback - 2
    print res
    return res


def train_model(ft,lbl):
    from sklearn.naive_bayes import GaussianNB as gnb
    model = gnb()
    #model = rfc(random_state=0)
    #model = knn(n_neighbors=10, weights='distance', p=2)
    ft[:,0:2] = np.zeros((ft.shape[0],2))
    ft[:,3:4] = np.zeros((ft.shape[0],1))


    print ft
    model.fit(ft, lbl)
    return model


def iterate_through_time_lengths(pre_energy_lvl, task_id, start_time, weekday):
    return np.array([[task_id, start_time, t, weekday, pre_energy_lvl] for t in xrange(1, 61, 1)])


def get_pred_vector(model,task_id, start_time, duration, weekday, pre_energy_lvl):
    inst = np.array([task_id, start_time, duration, weekday, pre_energy_lvl]).reshape(1, -1)
    pred = model.predict(inst)
    proba = model.predict_proba(inst)
    d_a = np.array(duration)
    return np.hstack(([d_a], pred, proba[0]))


def get_best_root(roots):
    for r in roots:
        if 0 < r < 60:
            return r


def estimate_model_maturity(outputs):
    no_shorter_that_seem_longer_cnt = len(outputs)
    for i in xrange(len(outputs)):
        for j in xrange(i):
            if outputs[i] < outputs[j]:
                no_shorter_that_seem_longer_cnt -= 1
                break
    m1 = no_shorter_that_seem_longer_cnt / float(len(outputs))
    m2 = (np.max(outputs) - np.min(outputs)) / 4.0
    return m1 * m2



def get_prediction_for_user(user, pre_energy_lvl, task_id, start_time, weekday):
    #remember; we're predicting the rating:
    #-2 WAY TOO SHORT; -1 TOO SHORT; 0 PERFECT; 1; TOO LONG; 2 WAY TOO LONG

    # naive model = rating = -4/60 * time + 2
    energy_minute_naive_conversion = [15, 20, 25, 35, 50]
    f = float(energy_minute_naive_conversion[pre_energy_lvl])
    naive_coeff = np.array([2 / f, -2])

    maturity = 0
    fit_coeff = naive_coeff
    if len(user.dataInstances) > 0:
        #get training data from user
        training_data = get_user_data_from_db(user)

        # add instances to bias model
        print "biasing model..."
        bias_low = np.array([[hash('coding'), 0, 0, 1, 2, -2],
                             [hash('coding'), 0, 1, 1, 2, -2],
                             [hash('coding'), 0, 2, 1, 2, -2],
                             [hash('coding'), 0, 3, 1, 2, -2],
                             [hash('coding'), 0, 4, 1, 2, -2]])

        bias_high = np.array([[hash('coding'), 0, 60, 1, 2, 2],
                              [hash('coding'), 0, 59, 1, 2, 2],
                              [hash('coding'), 0, 58, 1, 2, 2],
                              [hash('coding'), 0, 57, 1, 2, 2],
                              [hash('coding'), 0, 56, 1, 2, 2]])

        bias_energy = np.array([[hash('coding'), 0, 30, 1, 0, 2],
                                [hash('coding'), 0, 30, 1, 1, 1],
                                [hash('coding'), 0, 30, 1, 2, 0],
                                [hash('coding'), 0, 30, 1, 3, -1],
                                [hash('coding'), 0, 30, 1, 4, -2],
                                [hash('coding'), 0, 15, 1, 0, 1],
                                [hash('coding'), 0, 15, 1, 1, 0],
                                [hash('coding'), 0, 15, 1, 2, -1],
                                [hash('coding'), 0, 15, 1, 3, -2],
                                [hash('coding'), 0, 15, 1, 4, -2],
                                [hash('coding'), 0, 45, 1, 0, 2],
                                [hash('coding'), 0, 45, 1, 1, 2],
                                [hash('coding'), 0, 45, 1, 2, 1],
                                [hash('coding'), 0, 45, 1, 3, 0],
                                [hash('coding'), 0, 45, 1, 4, -1],
                                [hash('coding'), 0, 1, 1, 0, 2],
                                [hash('coding'), 0, 60, 1, 4, -2]
                                ])

        training_data = np.vstack((training_data,bias_high,bias_low,bias_energy))

        #get test iterations by iterating through time lengths
        test_iterations = iterate_through_time_lengths(pre_energy_lvl, task_id, start_time, weekday)
        #stack both for normalization/scaling
        normalizer_input = np.vstack((training_data[:,:-1],test_iterations))
        normalizer_out = preprocessing.minmax_scale(normalizer_input)
        [training_data_n, test_iterations_n] = np.vsplit(normalizer_out,[training_data.shape[0]])
        training_data_n = np.hstack((training_data_n,training_data[:,-1].reshape(-1,1)))
        model = train_model(training_data_n[:,:-1],training_data_n[:,-1])
        time_preds = np.array([get_pred_vector(model,*inst) for inst in test_iterations_n])

        #transform minutes back to normal
        time_preds[:,0] *= 60

        print time_preds
        fit_coeff = np.polyfit(time_preds[:, 0], time_preds[:, 1], 1)
        maturity = estimate_model_maturity(time_preds[:, 1])
        print "fit coeff: %s" % fit_coeff

    print "naive coeff: %s" % naive_coeff
    weighted_coeff = maturity * fit_coeff + (1 - maturity) * naive_coeff
    print "maturity: %s" % maturity
    print "weighted_coeff: %s" % weighted_coeff
    roots = np.roots(weighted_coeff)
    print "roots: %s" % roots
    root = get_best_root(roots)

    # if maturity < 0.5:
    #     eta = randint(-5,+5)
    #     print "root perturbation %s by %s" % (root,eta)
    #     root += eta

    return round(root)
