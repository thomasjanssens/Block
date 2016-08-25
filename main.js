import React from 'react'
import ReactDOM from 'react-dom'
import Remarkable from 'remarkable'
import xhr from 'xhr'

import TaskInputBox from './TaskInputBox'
import SprintBox from './SprintBox'
import BreakBox from './BreakBox'
import TimeFeedBackBox from './TimeFeedbackBox'

var MainContainer = React.createClass({
    getInitialState: function () {
        return {predictedTime: 0, taskName: "", uiState: "main", energy: "2"}
    },

    componentWillMount: function () {
        this.fetchServerVersion();
    },

    submitInputUpdate: function () {
        xhr({
            method: 'post',
            body: `taskName=${this.state.taskName}&energy=${this.state.energy}`,
            url: "/",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        }, (err, res, body) => {
            this.setState({predictedTime: body})
        });
    },

    handleTaskNameChange: function (name) {

        this.setState({taskName: name}, () => {
            this.submitInputUpdate();
        });
    },

    handleEnergyLevelChange: function (e) {
        this.setState({energy: e}, () => {
            this.submitInputUpdate();
        });
    },

    handleTaskStart: function () {
        //TODO tell the server to finalize the running task
        this.setState({uiState: "running"});
        this.setState({startTime:Date.now()});
    },

    submitFinishedSprint: function () {
        //tell the server to store the running task
        xhr({
            method: 'post',
            body: `task_name=${this.state.taskName}&pre_energy=${this.state.energy}&start_time=${this.state.startTime}&end_time=${this.state.endTime}&user_rating=${this.state.user_rating}&auto_rating=${this.state.auto_rating}&suggested_time=${this.state.predictedTime}`,
            url: "/finish_sprint",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        }, (e, r, b)=> {
        });
    },

    handleBreakRequest: function () {
        var endTime = Date.now();
        this.setState({endTime: endTime});
        var time_worked = (new Date(endTime))- (new Date(this.state.startTime))
        var minsWorked = time_worked/60/1000;
        console.log(endTime);
        console.log(this.state.startTime);
        console.log(minsWorked);

        if (minsWorked < this.state.predictedTime * 0.5) {
            this.handleTimeFeedbackGiven('4',true);
        } else if (minsWorked < this.state.predictedTime * 0.9) {
            this.handleTimeFeedbackGiven('3',true);
        } else if (minsWorked > this.state.predictedTime * 1.1) {
            this.handleTimeFeedbackGiven('2',true)
        } else if (minsWorked > this.state.predictedTime * 1.5) {
            this.handleTimeFeedbackGiven('1',true)
        } else {// within 0.8-1.2 of the predicted time
            this.setState({uiState: "time_feedback"});
        }
    },

    handleTimeFeedbackGiven: function (feedback_value,auto_feedback=false) {
        //record feedback and then do sync callback to POST
        this.setState({user_rating: feedback_value, auto_rating:auto_feedback}, () =>
            this.submitFinishedSprint());

        this.setState({breakStartTime:Date.now()});
        this.setState({uiState: "break"});
    },

    handleCancelTask: function () {
        //TODO tell the server to forget about the task
        this.goBackToMenu()
    },

    fetchServerVersion: function (){
                xhr({
            method: 'get',
            url: "/get_version",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        }, (err, res, body) => {
            console.log(body);
            this.setState({serverStamp: body})
        });
    },

    pollServerVersion: function (){
                xhr({
            method: 'get',
            url: "/get_version",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
                }, (err, res, body) => {
                    console.log(body);
                    console.log(this.state.serverStamp);
                    if (this.state.serverStamp < body) {
                        console.log('refresh');
                        location.reload();
                    }
                });
    },


    goBackToMenu: function () {
        this.pollServerVersion();
        this.handleTaskNameChange("");
        this.handleEnergyLevelChange(this.state.energy);
        this.setState(this.getInitialState());
    },

    handleTaskSwitch: function () {
        //TODO tell the server to finalize the running task
        this.goBackToMenu()
    },

    handleBreakFinish: function () {
        var breakEndTime = Date.now();
        var breakDuration = breakEndTime - this.state.breakStartTime;
        console.log('breakDuration');
        console.log(breakDuration);
        xhr({
            method: 'post',
            body: `break_start_time=${this.state.breakStartTime}&break_end_time=${breakEndTime}`,
            url: "/finish_break",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        }, (err, res, body) => {});
        this.goBackToMenu();


    },

    notifyMe: function (message) {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            return new Notification(message)
        }
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    return new Notification(message)
                }
            });
        }
    },

    allowStart: function () {
        return this.state.taskName != "";
    },

    makeTimeUpNotification: function() {
        var msg = "Block time is up, click here if you want to take a break.";
        var notification = this.notifyMe(msg);
        notification.onclick = function () {
            this.handleBreakRequest();
            notification.close();
        }.bind(this);
        setTimeout(function () {
            notification.close();
        }, 10000);

        var audio = new Audio('/static/ding.wav');
        audio.play();
    },

    render: function () {
        if (this.state.uiState === "main") {
            return (
                <div>
                <TaskInputBox
                    taskName={this.state.taskName}
                    onTaskStart={this.handleTaskStart}
                    onNameChange={this.handleTaskNameChange}
                    onEnergyLevelChange={this.handleEnergyLevelChange}
                    predictedTime={this.state.predictedTime}
                    allowStart={this.allowStart}
                    energy={this.state.energy}
                />
                    <br /> <br />
            <p style={{"fontSize" : "10px", "color":"gray"}}>version timestamp: {this.state.serverStamp}</p>
            </div>
            );
        }
        else if (this.state.uiState === "running") {
            return (
                <SprintBox
                    handleFinish={this.submitFinishedSprint}
                    handleBreak={this.handleBreakRequest}
                    handleCancelTask={this.handleCancelTask}
                    handleTaskSwitch={this.handleTaskSwitch}
                    time={parseInt(this.state.predictedTime)}
                    taskName={this.state.taskName}
                    onTimeUp={this.makeTimeUpNotification}
                />
            );

        }
        else if (this.state.uiState === "break") {
            return (
                <BreakBox
                    handleFinish={this.handleBreakFinish}
                    handleCancelTask={this.handleCancelTask}
                />
            );
        }
         else if (this.state.uiState === "time_feedback") {
            return (
                <TimeFeedBackBox onSubmit={this.handleTimeFeedbackGiven}/>
            );
        }
    }
});

ReactDOM.render(
    <MainContainer/>,
    document.getElementById('content')
);