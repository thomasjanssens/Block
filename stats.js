import Visualization from './Visualization'
import React from "react";

var Stats = React.createClass({
    render: function(){
        var horizon = 30;
        var today = new Date();
        console.log(today);
        var days = [];
        var daynames = ['Monday','Tuesday','Wednesay','Thursday','Friay','Saturday','Sunday'];
        var monthnames = ['Jan','Feb','Mar','Apr','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        for (var i = 0; i < horizon; i++){
            var date = new Date(today.getTime()-i*24*60*60*1000);
            console.log(i);
            console.log(date);
            days.push(
                <div>
                <h3>{daynames[date.getDay()]+' '+date.getDate()+' '+monthnames[date.getMonth()]+' '+date.getFullYear()}</h3>
                    <Visualization date={date} />
            </div>);
        }

        return(
            <div className="stats">
                <h1>Statistics</h1>
                <h2>Your statistics for the last {horizon} days</h2>
                <button onClick={this.props.exit}>Back</button>
                {days}
            </div>
        )
    }

});

export default Stats;