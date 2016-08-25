import * as React from "react";
import EnergyInput from './EnergyInput'
import xhr from "xhr";
var TaskInputBox = React.createClass({
    getInitialState: function () {
        return {favorites: []}
    },
    handleSubmit: function (e) {
        e.preventDefault();
        this.props.onTaskStart();
    },

    componentDidMount () {
      this.getFavorites()
    },

    getFavorites : function () {
       xhr({
           method: 'get',
           url: "/favorites",
           json: true
       }, (err, res, body) => {
           this.setState(body)
       });
    },

    handleFavoriteClick: function (e,f) {
        e.preventDefault();
        console.log(f);
        this.props.onNameChange(f);
    },

    render: function () {
        var buttons = this.state.favorites.map((fav) => <button key={fav} onClick={(e)=>this.handleFavoriteClick(e,fav)}>{fav}</button>);
        return (
            <form style={{'display':'inline'}} className="commentForm" onSubmit={this.handleSubmit}>
               What are you going to do next?{' '}
                <br /><br />
                <input
                    type="text"
                    placeholder="Create new activity..."
                    value={this.props.taskName}
                    onChange={(e)=>this.props.onNameChange(e.target.value)}
                />

                <br /><br />
                {buttons}
                <br /><br /><br />
                How energetic are you feeling?
                <EnergyInput handleChange={(e) => this.props.onEnergyLevelChange(e.target.value)} energy={this.props.energy}/>
                <br />
                Suggested time: {this.props.predictedTime}
                <br /><br />
                <div className={this.props.allowStart() ?'':"tooltip"}>
                <input type="submit" value="Start Block" disabled={this.props.allowStart() ? '' : "disabled"}/>
                {this.props.allowStart() ?'':<span className="tooltiptext"> 'Please select an activity first'</span>}
            </div>
            </form>
        );
    }
});
export default TaskInputBox