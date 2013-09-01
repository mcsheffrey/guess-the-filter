/** @jsx React.DOM */

var Comment = React.createClass({
  render: function() {
    return (
      React.DOM.div({
        className: 'photo-container',
        style: 'z-index: {this.props.photo_index}'
      }),
      React.DOM.div({
        className: 'photo',
        style: {
          backgroundImage: "url(" + this.props.img_url + ");"
        },
        id: '{this.props.id}',
        height: '612',
        width: '612'
      })
    );
  }
});

var Score = React.createClass({
  render: function() {
    return (
      <div class="score">{this.props.correctAnswers} / {this.props.totalAnswers}</div>
    );
  }
});

var FilterChooser = React.createClass({
  makeFilterSelection: function() {

    if (correctAnswer) {
      this.setState({
          score: this.state.score + 1
      });
    };

    
  },
  render: function() {
    return (
      <button class="btn" onClick={this.makeFilterSelection}>{this.props.filter}</button>
      <span class="seperator">or</span>
      <button class="btn" onClick={this.makeFilterSelection}>{this.props.filter}</button>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: React.autoBind(function() {
    this.setState({data: [
      {
        fake_filter: "Rise",
filter: "Mayfair",
img_url: "http://distilleryimage5.s3.amazonaws.com/6db00704106e11e3b8a622000a1fbdb1_7.jpg",
media_id: "532971892752669581_22899757",
photo_index: 8994
  },{
    fake_filter: "Amaro",
filter: "Valencia",
img_url: "http://distilleryimage4.s3.amazonaws.com/ca238202107011e382d422000a9e516a_7.jpg",
media_id: "532980399621900352_210513425",
photo_index: 8993}
]});
  }),
	getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
        <header>
            <div class="row clearfix">
              <h1 class="title">Guess the filter</h1>
              <Score data={this.state.data} />
            </div>
        </header>   
        
        <div class="main">
          <div class="wrap">
            <CommentList data={this.state.data} />
          </div>

          <FilterChooser data={this.state.data} />
        </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function (comment) {
      return <Comment img_url={comment.img_url} media_id={comment.media_id} photo_index={comment.photo_index} />;
    });
    return <div class="commentList">{commentNodes}</div>;
  }
});

React.renderComponent(
  <CommentBox />,
  document.getElementById('output')
);