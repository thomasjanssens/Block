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

    keyCheck: function (e) {
        console.log(e);
        if(e.key == "Enter" && this.props.allowStart) {
            this.props.onTaskStart();
        }

    },

    handleFavoriteClick: function (e,f) {
        e.preventDefault();
        console.log(f);
        this.props.onNameChange(f);
    },

    render: function () {
        var buttons = this.state.favorites.map((fav) => <button key={fav}
                                                                onClick={(e)=>this.handleFavoriteClick(e, fav)}
                                                                onKeyDown={this.keyCheck}>{fav}{" \u00D7"}</button>);
        return (

            <div className="taskInputBox">
                  <input style={{visibility:"hidden"}} onKeyDown={this.keyCheck}/>
                <div className="taskColumnBox">
                    <div className="headingBlock">
                        <h1> What are you going to work on during this block?</h1>
                    </div>

                    <div className="taskNameBox">
                        <h2> Enter the name of the task you'll do in this block </h2>
                        <form style={{'display': 'inline'}} className="commentForm" onSubmit={this.handleSubmit}>
                            <input
                                type="text"
                                placeholder="Enter task name"
                                value={this.props.taskName}
                                onChange={(e)=>this.props.onNameChange(e.target.value)}
                                 onKeyDown={this.keyCheck}
                            />
                        </form>
                        <p> Remember, try not to make it too specific.
                            Try something like "planning"</p>
                    </div>

                    <div className="previousTasksBox">
                        <h2> Or choose from some of your favourites </h2>
                        {buttons}
                    </div>
                </div>

                <div className="continueBox">
                    <img src="/static/circles.png"  width={40+"px"} /> <br />
                    <img className={this.props.allowStart()?"":"gray"}
                         src="/static/arrow.png" width={50+"px"}
                         onClick={this.props.allowStart()?this.props.onTaskStart:""} />
                    <p className="continueText">{'To continue, click arrow or press Enter'}</p>
                </div>

            </div>
        );
    }
});
export default TaskInputBox