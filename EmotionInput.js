import React from "react";
import Slider from "react-rangeslider"
require('rc-slider/assets/index.css');
var Rcslider = require('rc-slider');

var EmotionInput =  React.createClass({
    getInitialState: function(){
        return {
            value: 10,
        };
    },

    handleChange: function(value) {
        this.setState({
            value: value,
        });
    },

    render: function () {
        return (
            <div>
                <h1>How are you feeling about starting this activity?</h1>

                <h2>Move the slider to best describe how you're feeling</h2>

                <div className="emotionBox">
                    <img className="leftImage" src="/static/slothlazy.png" height={200 + "px"}/>
                    <div className="slider">
                        <Rcslider tipFormatter={null} max={4}
                                  onAfterChange={this.props.onEnergyLevelChange}
                                                      marks={{0: "1", 1: "2", 2: "3", 3: "4", 4: "5"}}
                                                      defaultValue={parseInt(this.props.energy)}/>
                    </div>
                    <img className="rightImage" src="/static/slothenergetic.png" height={200 + "px"}/>
                </div>

                <div className="continueBox">
                    <img  className="flip" src="/static/circles.png" width={40 + "px"}/> <br />
                    <img className="continueArrow"
                         src="/static/arrow.png" width={50 + "px"}
                         onClick={this.props.onTaskStart}/>
                    <p className="continueText">{'To continue, click arrow or press Enter'}</p>
                </div>
            </div>
        );
    }
});

export default EmotionInput