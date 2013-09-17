/** @jsx React.DOM */
var LEADERBOARD_SIZE = 5;

// Create our Firebase reference
var scoreListRef = new Firebase('https://guess-the-filter.firebaseIO.com///scoreList');

// Keep a mapping of firebase locations to HTML elements, so we can move / remove elements as necessary.
var htmlForPath = {};

// Helper function that takes a new score snapshot and adds an appropriate row to our leaderboard table.
function handleScoreAdded(scoreSnapshot, prevScoreName) {
  var newScoreRow = $("<tr/>");
  newScoreRow.append($("<td/>").append($("<em/>").text(scoreSnapshot.val().name)));
  newScoreRow.append($("<td/>").text(scoreSnapshot.val().score));

  // Store a reference to the table row so we can get it again later.
  htmlForPath[scoreSnapshot.name()] = newScoreRow;

  // Insert the new score in the appropriate place in the table.
  if (prevScoreName === null) {
    $("#leaderboardTable").append(newScoreRow);
  }
  else {
    var lowerScoreRow = htmlForPath[prevScoreName];
    lowerScoreRow.before(newScoreRow);
  }
}

// Helper function to handle a score object being removed; just removes the corresponding table row.
function handleScoreRemoved(scoreSnapshot) {
  var removedScoreRow = htmlForPath[scoreSnapshot.name()];
  removedScoreRow.remove();
  delete htmlForPath[scoreSnapshot.name()];
}

// Create a view to only receive callbacks for the last LEADERBOARD_SIZE scores
var scoreListView = scoreListRef.limit(LEADERBOARD_SIZE);

// Add a callback to handle when a new score is added.
scoreListView.on('child_added', function (newScoreSnapshot, prevScoreName) {
  handleScoreAdded(newScoreSnapshot, prevScoreName);
});

// Add a callback to handle when a score is removed
scoreListView.on('child_removed', function (oldScoreSnapshot) {
  handleScoreRemoved(oldScoreSnapshot);
});

// Add a callback to handle when a score changes or moves positions.
var changedCallback = function (scoreSnapshot, prevScoreName) {
  handleScoreRemoved(scoreSnapshot);
  handleScoreAdded(scoreSnapshot, prevScoreName);
};
scoreListView.on('child_moved', changedCallback);
scoreListView.on('child_changed', changedCallback);

// When the user presses enter on scoreInput, add the score, and update the highest score.
$("#scoreInput").keypress(function (e) {
  if (e.keyCode == 13) {
    var newScore = Number($("#scoreInput").val());
    var name = $("#nameInput").val();
    $("#scoreInput").val("");

    if (name.length === 0)
      return;

    var userScoreRef = scoreListRef.child(name);
    
    // Use setWithPriority to put the name / score in Firebase, and set the priority to be the score.
    userScoreRef.setWithPriority({ name:name, score:newScore }, newScore);
  }
});


var Media = React.createClass({
  render: function() {
    console.log('this', this._domIndex);
    
    return (
      React.DOM.div({
        className: 'photo-container ' + this.props.class_transition,
        style: {
          zIndex: this.props.photo_index
        }
      },
        React.DOM.div({
          className: 'photo',
          style: {
            backgroundImage: "url(" + this.props.img_url + ")"
          },
          id: '{this.props.id}',
          height: '612',
          width: '612'
        })
      )
    );
  }
});

var Score = React.createClass({
  render: function() {
    return (
      <div class="score">{this.props.score.correct} / {this.props.score.total}</div>
    );
  }
});

var FilterChooser = React.createClass({
  render: function() {
      return (
        <a class="btn filter-btn" onClick={this.props.onDestroy}>
          <span class="filter-btn-inner">{this.props.filter}</span>
        </a>
      );
    }
  });

var GuessTheFilter = React.createClass({
  config: {
    igPhotoFilters: ['Amaro','Mayfair','Rise','Valencia','Hudson','X-Pro II','Sierra','Willow','Lo-fi','Earlybird','Sutro','Toaster','Brannan','Inkwell','Walden','Hefe','Nashville','1977','Kelvin'],
    igVideoFilters: ['Stinson', 'Vespar', 'Clarendon', 'Maven', 'Gingham', 'Ginza', 'Skyline', 'Dogpatch', 'Brooklyn', 'Moon', 'Helena', 'Ashby', 'Charmes'],
    clientID: '4750e3ffeb9c4648b792deeaf66b6b71',
    url: 'https://api.instagram.com/v1/media/popular?client_id=4750e3ffeb9c4648b792deeaf66b6b71&callback=?',
    photos: [],
    currentFilter: '',
    photoIndex: 9000,
    previousMedias: []
  },

  fetch: function() {
    var self = this;

    console.log('url', this.config.url);
    

    return $.ajax({
      url: this.config.url,
      dataType: 'jsonp',
      success: self.demoCallback
    });
  },

  /**
   * [demoCallback description]
   * @param  {[type]} results    [description]
   * @param  {[type]} textStatus [description]
   * @param  {[type]} xhr        [description]
   * @return {[type]}            [description]
   */
  demoCallback: function(results, textStatus, xhr) {
    
    var self = this,
        randomFilter,
        previousMedias,
        photos = [],
        sortedFilters = [];

    console.log('results',results);

    // If we get a proper response from the server
    if (results.meta.code === 200 ) {

      console.log('results.data', results.data.length);
      

      for (var i = 0; i < results.data.length; i++) {

        // Excluding media with no filters
        if (results.data[i].filter && typeof results.data[i].filter !== undefined && results.data[i].filter !== 'Normal') {

          // Check against previousMedia array to make sure media hasn't already been seen
          // console.log(this.checkAgainstPreviousMedias(results.data[i]));
          
          // if (this.checkAgainstPreviousMedias || this.checkAgainstPreviousMedias(results.data[i])) {

            // Add random filter if photo
            if (results.data[i].type === "image") {
              console.log(this.config.igPhotoFilters, results.data[i].filter);
              
              randomFilter = this.pickRandomFilter(this.config.igPhotoFilters, results.data[i].filter);
              console.log('image', randomFilter);
              
            }

            // add random filter if video
            if (results.data[i].type === "video") {
              randomFilter = this.pickRandomFilter(this.config.igVideoFilters, results.data[i].filter);
              console.log('video', randomFilter);
            }
            
            sortedFilters = [results.data[i].filter, randomFilter];
            
            sortedFilters.sort();

            console.log(sortedFilters);
            

            photos.push({
              img_url: results.data[i].images.standard_resolution.url,
              filters: sortedFilters,
              correct_filter: results.data[i].filter,
              photo_index: this.config.photoIndex,
              media_id: results.data[i].id,
              classTransition: ''
            });

            console.log('push', photos);
            
            console.log(this.config.photoIndex);
            
            
            // decrement photo index to place new content behind old content;
            this.config.photoIndex--;

          // };
        }
      }; // end for loop

      // Combine previous medias with newly loaded medis
      // var combinedMedias = this.config.previousMedias.concat(this.config.photos)
      // console.log(combinedMedias );
      

      // Store already viewed medias in local storage so we don't see them again
      // Set timestamp on medias timestamp: new Date().getTime()
      // Utils.store('medias', combinedMedias);

      // If we don't have enough media then request more medias!
      // if (this.photos.length < 4) {
      //  this.fetch();
      // };
      // 
      console.log('photos', photos);
      
      this.setState({data: this.state.data.concat(photos)});

      this.setState({current: this.state.data[0].filters});

      this.setState({filters: photos[0].filters});

    }
    
  },

  /**
   * Loop through fetched media ids and check them against media ids saved in localstorage, 
   * prevents user from seeing same media twice
   * @param  {[type]} media [description]
   * @return {[type]}       [description]
   */
  checkAgainstPreviousMedias: function(media) {
    console.log('previousMedias', this);
    
    for (var i = 0; i < this.previousMedias.length; i++) {

      // If any of the new media objects we've fetched matches an old media object we don't want to push it to the new array
      // console.log(this.previousMedias[i].media_id)
      // console.log(media.id);
      
      if (this.previousMedias[i].media_id === media.id) {
        return false;
      }

      return true;
    };
  },

  /**
   * Selects random filter from array
   * @param  {Array} Array of filters
   * @param  {String} Exception filter name
   * @return {String} random filter name
   */
  pickRandomFilter: function(items, exceptionItem) {
    console.log();
    
    var item = items[Math.floor(Math.random()*items.length)];

    // make sure fake filter is not the same as real filter
    if (item.localeCompare(exceptionItem)) {
      return item;
    } else {
      return this.pickRandomFilter(items, exceptionItem);
    }
  },

  loadMediaFromServer: function() {

    this.fetch();

    

  },
	getInitialState: function() {
    return {
      data: [],
      filters: [],
      score: {
        correct: 0,
        total: 0
      },
      transition: false
    };
  },
  componentDidMount: function() {
    this.loadMediaFromServer();
    // setInterval(this.loadMediaFromServer, this.props.pollInterval);
  },
  makeSelection: function(filter) {
    var self = this,
        sortedFilters = [];

    console.log('event', this);
    console.log($(this.getDOMNode()));
    
    
    console.log(filter);
    console.log(self.state.data[0].correct_filter);
    
    

    // If correct answer increment score
    if (filter === this.state.data[0].correct_filter) {

      this.state.score.correct++;

      this.setState({
        transition: 'state-correct fadeIn'
      });
    } else {
      this.setState({
        transition: 'state-incorrect fadeIn'
      });
    }

    this.state.score.total++;

    console.log(this.state);

    setTimeout(function() {
      self.state.transition = '';

      self.setState({
        data: self.state.data.slice(1)
      });

      self.setState({filters: self.state.data[0].filters});

      if (self.state.data.length < 4) {
        
        self.fetch();
      };
    
    }, 1000);

  },
  render: function() {
    var self = this,
        filterNodes = this.state.filters.map(function (filter) {
      
      return (
        <FilterChooser filter={filter} onDestroy={self.makeSelection.bind(this, filter)}/>
      );
    });

    return (
      <div class="container">
        <header class="header">
          <div class="row clearfix">
            <h1 class="title">Guess the filter</h1>
            <Score score={this.state.score} />
          </div>
        </header>
        <div class="main">
          <div class="wrap">
            <MediaList data={this.state.data} transition={this.state.transition} />

            <div class="filter-items">{filterNodes}</div>
            <span class="seperator">or</span>
          </div>

        </div>
      </div>
    );
  }
});


var MediaList = React.createClass({
  render: function() {
    var self = this,
        mediaNodes = this.props.data.map(function (media) {
      return (
        <Media img_url={media.img_url} media_id={media.media_id} photo_index={media.photo_index} class_transition={self.props.transition} />
      );
    });
    return <div class="images-wrapper">{mediaNodes}</div>;
  }
});

React.renderComponent(
  <GuessTheFilter />,
  document.getElementById('output')
);