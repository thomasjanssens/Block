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

    handleFavoriteClick: function (e, f) {
        console.log('handleFavoriteClick start');

        e.preventDefault();
        if (this.state.favorites.indexOf(f) !== -1) {
            this.props.onNameChange(f);
        }
        console.log('handleFavoriteClick end');
    },


    handleDeleteClick: function (fav) {
        console.log('deleting "'+fav+'"');
        xhr({
           method: 'post',
            body: `fav=${fav}`,
           url: "/delete_favorite",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        }, (err, res, body) => {
            this.setState({favorites:this.getFavorites()},()=>
            {this.props.onNameChange("");});
        });

    },

    render: function () {
        //here the onClick should be on button for maximal clickability,
        //but this creates sort of an event race condition for setting / removing activity when
        //pressing 'x'
        var buttons = this.state.favorites.map(
            (fav) => <button key={fav}
                             onKeyDown={this.keyCheck}>
                <span onClick={(e)=>this.handleFavoriteClick(e, fav)}>{fav} </span>
                <span onClick={() =>this.handleDeleteClick(fav)}>{" \u00D7"}</span></button>);
        return (

            <div className="taskInputBox">
                  <input style={{visibility:"hidden"}} onKeyDown={this.keyCheck}/>
                <div className="taskColumnBox">
                    <div className="headingBlock">
                        <h1>What are you going to do next?</h1>
                    </div>

                    <div className="taskNameBox">
                        {/*<h2> Enter the name of the task you'll do in this block </h2>*/}
                        <form style={{'display': 'inline'}} className="commentForm" onSubmit={this.handleSubmit}>
                            <input
                                type="text"
                                placeholder="Enter activity name"
                                value={this.props.taskName}
                                onChange={(e)=>this.props.onNameChange(e.target.value)}
                                 onKeyDown={this.keyCheck}
                            />
                        </form>
                        <p>Think about general activities, like "planning", not specfic tasks.
                            This will help Block learn better!</p>
                    </div>

                    <div className="previousTasksBox">
                        {/*<h2> Or choose from some of your favourites </h2>*/}
                        {buttons}
                    </div>
                </div>

                <div className="continueBox">
                    <img src="/static/circles.png"  width={40+"px"} /> <br />
                    <img className={this.props.allowStart()?"":"gray"}
                         src="/static/arrow.png" width={50+"px"}
                         onClick={this.props.allowStart()?this.props.onTaskStart:""} />
                    {/*<p className="continueText">{'To continue, click arrow or press Enter'}</p>*/}
                </div>

            </div>
        );
    }
});
export default TaskInputBox