
from sklearn.ensemble import RandomForestClassifier as rfc
import random as rand
import numpy as np

def generate_task_report():
    #features
    pre_energy_lvl = rand.randint(3,5)
    task_id = rand.randint(1,10)
    start_time = rand.uniform(9,18)
    weekday = rand.randint(1,5)
    task_time = rand.randint(0,60)

    #targets
    post_energy_lvl = max(-2,min(2,-int((2*pre_energy_lvl+0.5)/2**(task_time/25.0)-5+rand.uniform(0,2))))

    return np.array([pre_energy_lvl,task_id,start_time,weekday,task_time,post_energy_lvl])


def generate_task_reports(amount):
    res = np.array([generate_task_report() for _ in range(amount)])
    #print res
    return res


def train_model(train):
    model = rfc()
    model.fit(train[:, :-1], train[:, -1])
    return model


def iterate_through_time_lengths(model,pre_energy_lvl,task_id,start_time,weekday):
    return np.array([get_pred_vector(model,pre_energy_lvl,task_id,start_time,weekday,t) for t in xrange(1,61,2)])


def get_pred_vector(model,pre_energy_lvl, task_id, start_time, weekday, t):
    inst = np.array([pre_energy_lvl, task_id, start_time, weekday, t]).reshape(1, -1)
    pred = model.predict(inst)
    proba = model.predict_proba(inst)
    t = np.array(t)
    return np.hstack(([t],pred,proba[0]))

def get_best_root(roots):
    for r in roots:
        if 0 < r < 60:
            return r

def main():
    print "learning..."
    #generate tasks
    train = generate_task_reports(100)
    model = train_model(train)

    while(True):
        test = generate_task_report()[:-2]
        print "Given task with ID %i \n at energy level %i \n at time %i:%i hrs, " \
              "\n weekday number %i, \n predicted sprint user sprint ratings (-2 to +2) for 1-60 mins:"\
                % (test[1],test[0],test[2],(test[2]-int(test[2]))*60,test[3])
        time_preds = iterate_through_time_lengths(model,*test)
        print time_preds
        #fit a n-deg polynomial thru predicted time-user_emotion pairs
        fit_coeff = np.polyfit(time_preds[:,0],time_preds[:,1],2)
        print fit_coeff
        #find root(s) where emotion == 0, i.e. "best balance" time
        #TODO instead of fitting at the predicted value, fit at point interpolated between probability-weighted ratings
        roots = np.roots(fit_coeff)
        print roots

        root = get_best_root(roots)
        print "work for %i minutes!\n" % root
        user_feedback = int(raw_input("from -2 to 2, was the current time too long?\n"))
        new_instance = np.hstack((test,root,user_feedback))
        print new_instance
        train = np.vstack((train,new_instance))
        model = train_model(train)
        print train.shape
        raw_input("--enter to continue--")


if __name__ == "__main__":
    main()