import * as React from "react";
var TimerBox = React.createClass({
    getInitialState: function () {
        return ({start: Date.now(), elapsed: 0, notificationFired:false})
    },
    componentDidMount: function () {
        this.setState({start: Date.now(), notificationFired:false})
          this.interval = setInterval(this.tick, 100);
    },
    componentWillUnmount: function () {
        clearInterval(this.interval);
    },
    tick: function () {
        this.setState({elapsed: new Date() - this.state.start},
            () => {
                 var totalSeconds = parseInt(this.state.elapsed) / 1000
                 totalSeconds = Math.floor(this.props.time) * 60 - totalSeconds;
                if (this.props.time >0 && totalSeconds <= 0 && !this.state.notificationFired) {
                    this.setState({notificationFired: true},()=>{
                    this.props.onTimeUp();});
                }
            });
    },

    setNotificationFired(){
    },



    render: function () {
        var totalSeconds = parseInt(this.state.elapsed) / 1000;
        if (this.props.time > 0) { //if given time <= 0 we count UP, not DOWN
            totalSeconds = Math.floor(this.props.time) * 60 - totalSeconds;
        }

        var isNeg = totalSeconds<0;
        totalSeconds = Math.abs(totalSeconds);

        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds - minutes * 60);
        return (
            <div>
                {isNeg?"-":""}{minutes}:{seconds < 10 ? "0" : ""}{seconds}
            </div>
        )
    }
});
export default TimerBox