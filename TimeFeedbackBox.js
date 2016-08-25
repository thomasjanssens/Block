import * as React from "react";
var TimeFeedBackBox = React.createClass({
    getInitialState: function () {
        return ({value:'2'})
    },

    handleSubmit: function (e) {
        e.preventDefault();
        this.props.onSubmit(this.state.value);
    },
    render: function () {
        return (
            <div>
                How did you find the suggested block time?
                <br /> <br />
                <form onSubmit={this.handleSubmit}>
                    Too short
                    <input type="range" min="0" max="4" onInput={(e)=>{this.setState({value:e.target.value})}}/>
                    Too long
                    <br /> Perfect

                <br /><br />
                <input type="submit" value="Take break"/>
                </form>
            </div>
        )
    }
});

export default TimeFeedBackBox