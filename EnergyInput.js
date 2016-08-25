import * as React from "react";
var EnergyInput = React.createClass({
    render: function () {
        return (
            <div className="emoji"> {'\uD83D\uDE12 '}
                <input type="range" name="energy" min="0" max="4" onChange={this.props.handleChange}
                       value={this.props.energy}/>
                {' \uD83D\uDE03'}</div>
        )
    }
});

export default EnergyInput