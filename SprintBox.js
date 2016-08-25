import * as React from "react";
import TimerBox from './TimerBox'

var SprintBox = React.createClass({
    render: function () {
        return (
            <div>
                <p>Working on: {this.props.taskName}</p>
                Suggested break in:
                <TimerBox time={this.props.time} onTimeUp={this.props.onTimeUp} />
                <button className="taskButton" onClick={this.props.handleBreak}>Take a break</button>
                <button className="taskButton" onClick={this.props.handleTaskSwitch}>Switch activity</button>
                <button className="taskButton" onClick={this.props.handleCancelTask}>Oops, forgot about block</button>
            </div>
        )
    }
});
export default SprintBox