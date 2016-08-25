import * as React from "react"
import TimerBox from './TimerBox'
var BreakBox = React.createClass({
    render: function () {
        return (
            <div>
                <p>Relax, you're on break.</p>
                <TimerBox time="0"/>
                <button className="taskButton" onClick={this.props.handleFinish}>Back to work</button>
                {/*<button className="taskButton" onClick={this.props.handleCancelTask}>Oops, I'd already gone back to work</button>*/}
            </div>
        )
    }
});
export default BreakBox