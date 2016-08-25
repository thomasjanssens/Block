import numpy as np
import random as rand
import math

from sklearn.ensemble import RandomForestClassifier as rfc
from sklearn.ensemble import RandomForestRegressor as rfr
from sklearn.cross_validation import cross_val_score
import numpy as np
import random as rand
import math

def generate_task_report():
    #features
    pre_energy_lvl = rand.randint(0,10)
    start_time = rand.uniform(9,18)

    #targets
    task_time = rand.uniform(0,3)
    post_energy_lvl = rand.randint(0,10)
    task_satisfaction = rand.randint(0,10)

    return np.array([pre_energy_lvl,start_time,task_time,post_energy_lvl,task_satisfaction])


def generate_task_reports(amount):
    res = np.array([generate_task_report() for _ in range(amount)])
    #print res
    return res

def train_models(feats,tgts):
    model = rfc()
    model.fit(feats,tgts)
    return model

def main():
    #generate tasks
    generate_task_reports(100)

    #generate model




if __name__ == "__main__":
    main()