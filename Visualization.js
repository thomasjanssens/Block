import * as React from "react";
import xhr from 'xhr' ;
import * as ReactDOM from "react/lib/ReactDOM";

var Visualization = React.createClass({
    getInitialState: function(){
        return {stats:''}
    },

    componentDidMount: function(){
        this.fetchVariables();
    },


    fetchVariables: function () {
        xhr({
            method: 'get',
            url: "/get_block_stats",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        }, (err, res, times_body) => {
            xhr({
                method: 'get',
                url: "/get_break_stats",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                }
            }, (err, res, breaks_body) => {
                console.log(times_body);
                var block_times = this.processVariables(times_body);
                var break_times = this.processVariables(breaks_body);
                this.createRenderableTimes(block_times, break_times);
            });
        });
    },

    processVariables: function(body){
        var root = JSON.parse(body);
        var times = [];
        console.log(root);
        for (var instance of root) {
            console.log(instance);
            var startDate=new Date(instance.start_time);
            var endDate=new Date(instance.end_time);
            if (startDate.getDay() == new Date("2016-08-24T16:31:04Z").getDay()) {
                var start_minutes_in_day = startDate.getHours() * 60 + startDate.getMinutes();
                var end_minutes_in_day = endDate.getHours() * 60 + endDate.getMinutes();
                console.log(start_minutes_in_day);
                console.log(end_minutes_in_day);
                times.push({start:start_minutes_in_day,end:end_minutes_in_day})
            }
        }
        console.log(times);

        times.sort((a,b) => a.start-b.start);
        return times;
    },

    createRenderableTimes : function(block_times,break_times){
        var width = 500;
        var inner_margin = 10;
        var height = 30;
        var start_hour = 8;
        var end_hour = 18;
        var min_offset = start_hour*60;
        var mins_in_day = (end_hour-start_hour)*60.0;
        var adj = (width-2*inner_margin)/mins_in_day;
        console.log(adj);
        console.log(mins_in_day);
        console.log(min_offset);
        // var c = <canvas ref={(c) => this.context = c.getContext('2d')} width={width} height={height}>canvas goes here</canvas>;
        // console.log(c);
        // var ctx = this.context;

        var canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
        canvas.width = width;
        canvas.height = height;
        canvas.style = {borderWidth:1+'px', borderStyle:'solid', borderColor:'#000000'};
        var ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;
        console.log(ctx);
        console.log(block_times);
        console.log(break_times);
        this.drawBlocks(ctx, block_times, "#00FF00", min_offset, adj, inner_margin, height);
        this.drawBlocks(ctx, break_times, "#0000FF", min_offset, adj, inner_margin, height);
        ctx.fillStyle = "#888888";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        for(var j = start_hour; j <= end_hour; j++){
            let x_pos = Math.min((j*60-min_offset)*adj+inner_margin,width);
            ctx.fillRect(x_pos, height/2, 1, height/2);
            ctx.fillText(j,x_pos,12);
        }

        ctx.fillStyle = "#FF0000";
        var now= new Date(Date.now());
        console.log(now);
        var mins = now.getHours()*60+now.getMinutes();
        console.log(mins);
        var x_pos = Math.min((mins-min_offset)*adj+inner_margin,width);
        console.log(x_pos);
        ctx.fillRect(x_pos, 0, 1, height);
       // http://stackoverflow.com/questions/30296341/rendering-returning-html5-canvas-in-reactjs
    },


    drawBlocks: function(ctx, blocks, color, min_offset, adj, inner_margin, height) {
        ctx.fillStyle = color;
        for (var i = 0; i < blocks.length; i++) {
            var x = (blocks[i].start - min_offset) * adj + inner_margin;
            var w = (blocks[i].end - min_offset) * adj - x + inner_margin;
            ctx.fillRect(x, height / 2, w, height / 2);
        }
    },



  render: function() {
        return (
            <div>
                <canvas ref="myCanvas" />
            </div>
        );
  }
});

export default Visualization