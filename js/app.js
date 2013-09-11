/** @jsx React.DOM */

var Utils = {
  // https://gist.github.com/1308368
  uuid: function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b},
  pluralize: function( count, word ) {
    return count === 1 ? word : word + 's';
  },
  store: function( namespace, data ) {
    if ( arguments.length > 1 ) {
      return localStorage.setItem( namespace, JSON.stringify( data ) );
    } else {
      var store = localStorage.getItem( namespace );
      return ( store && JSON.parse( store ) ) || [];
    }
  }
};


var Comment = React.createClass({
  render: function() {
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

var CommentBox = React.createClass({
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
        photos = [];

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
            }

            // add random filter if video
            if (results.data[i].type === "video") {
              randomFilter = this.pickRandomFilter(this.config.igVideoFilters, results.data[i].filter);
            }

            console.log(randomFilter);
            

            

            photos.push({
              img_url: results.data[i].images.standard_resolution.url,
              filter: results.data[i].filter,
              fake_filter: randomFilter,
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

      this.setState({current: this.state.data[0].filter});

      this.setState({filter: [photos[0].filter, photos[0].fake_filter]});

    }
    
  },

  /**
   * [checkAgainstPreviousMedias description]
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
    if (item !== exceptionItem) {
      return item;
    } else {
      return this.pickRandomFilter(item, exceptionItem);
    }
  },

  loadCommentsFromServer: function() {

    this.fetch();

    

  },
	getInitialState: function() {
    return {
      data: [],
      filter: [],
      current: '',
      score: {
        correct: 0,
        total: 0
      },
      transition: false
    };
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    // setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  makeSelection: function(filter) {
    console.log('event', this);
    console.log($(this.getDOMNode()));
    
    
    console.log(filter);
    console.log(this.state.current);

    // If correct answer increment score
    if (filter === this.state.current) {

      this.state.score.correct++;

    };

    this.state.score.total++;

    console.log(this.state);

    this.setState({
      transition: 'animate-fly-out-left'
    });

    // setTimeout(function() {
    //   this.state.data[0].stateTransition;
    // }, milliseconds);

    this.setState({
      data: this.state.data.slice(1)
    });

    this.setState({current: this.state.data[0].filter});

    this.setState({filter: [this.state.data[0].filter, this.state.data[0].fake_filter]});

    if (this.state.data.length < 4) {
      
      this.fetch();
    };
    
  },
  render: function() {
    var self = this,
        filterNodes = this.state.filter.map(function (filter) {
      
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
            <CommentList data={this.state.data} transition={this.state.transition} />

            <div class="filter-items">{filterNodes}</div>
            <span class="seperator">or</span>
          </div>

        </div>
      </div>
    );
  }
});


var CommentList = React.createClass({
  render: function() {
    var self = this,
        commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment img_url={comment.img_url} media_id={comment.media_id} photo_index={comment.photo_index} class_transition={self.props.transition} />
      );
    });
    return <div class="images-wrapper">{commentNodes}</div>;
  }
});

React.renderComponent(
  <CommentBox />,
  document.getElementById('output')
);