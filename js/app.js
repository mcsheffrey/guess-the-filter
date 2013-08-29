/** @jsx React.DOM */
var CommentBox = React.createClass({
	getInitialState: function() {
    return {data: []};
  },
  render: function() {
    return (
      <div class="commentBox">
        Hello, world! I am a CommentBox.
      </div>
    );
  }
});
React.renderComponent(
  <CommentBox />,
  document.getElementById('output')
);