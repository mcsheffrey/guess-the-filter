/* ============================================================
 * Guess The Filter
 * http://guessthefilter.com/
 * @mcsheffrey
 * ============================================================ */

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



var GuessTheFilter = {

	/**
	 * [init description]
	 * @return {[type]} [description]
	 */
	init: function() {
		var self = this;

		this.igPhotoFilters = ['Amaro','Mayfair','Rise','Valencia','Hudson','X-Pro II','Sierra','Willow','Lo-fi','Earlybird','Sutro','Toaster','Brannan','Inkwell','Walden','Hefe','Nashville','1977','Kelvin'];
		this.igVideoFilters = ['Stinson', 'Vespar', 'Clarendon', 'Maven', 'Gingham', 'Ginza', 'Skyline', 'Dogpatch', 'Brooklyn', 'Moon', 'Helena', 'Ashby', 'Charmes']
		this.clientID = '4750e3ffeb9c4648b792deeaf66b6b71';
		this.url = 'https://api.instagram.com/v1/media/popular?client_id=' + this.clientID + '&callback=?';
		this.photos = [];
		this.currentFilter = '';
		this.curentScore = {
			correctAnswers: 0,
			totalAnswers: 0
		}
		this.photoIndex = 9000;
		this.previousMedias = [];

		// Retrieve medias from local storage to check against
		GuessTheFilter.previousMedias = Utils.store('medias');
		// console.log(GuessTheFilter.previousMedias);

		// Fetch first medias
		this.fetch();

		$('body').on('click', '.filter-btn', this.makeFilterSelection);
	},

	/**
	 * [fetch description]
	 * @return {[type]} [description]
	 */
	fetch: function() {
		var self = this;

		return $.ajax({
			url: this.url,
			dataType: 'jsonp',
			success: this.demoCallback
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
				previousMedias;

		console.log(results);

		// If we get a proper response from the server
		if (results.meta.code === 200 ) {

			for (var i = 0; i < results.data.length; i++) {

				// Excluding media with no filters
				if (results.data[i].filter && typeof results.data[i].filter !== undefined && results.data[i].filter !== 'Normal') {

					// Check against previousMedia array to make sure media hasn't already been seen
					console.log(GuessTheFilter.checkAgainstPreviousMedias(results.data[i]));
					
					// if (GuessTheFilter.checkAgainstPreviousMedias || GuessTheFilter.checkAgainstPreviousMedias(results.data[i])) {

						// Add random filter if photo
						if (results.data[i].type === "image") {
							randomFilter = GuessTheFilter.pickRandomFilter(GuessTheFilter.igPhotoFilters, results.data[i].filter);
						}

						// add random filter if video
						if (results.data[i].type === "video") {
							randomFilter = GuessTheFilter.pickRandomFilter(GuessTheFilter.igVideoFilters, results.data[i].filter);
						}

						console.log(randomFilter);
						

						GuessTheFilter.currentFilter = results.data[i].filter;

						GuessTheFilter.photos.push({
							img_url: results.data[i].images.standard_resolution.url,
							filter: results.data[i].filter,
							fake_filter: randomFilter,
							photo_index: GuessTheFilter.photoIndex,
							media_id: results.data[i].id
						});

						console.log('push', GuessTheFilter.photos);
						
						console.log(GuessTheFilter.photoIndex);
						
						
						// decrement photo index to place new content behind old content;
						GuessTheFilter.photoIndex--;

					// };
				}
			}; // end for loop

			

			// Combine previous medias with newly loaded medis
			var combinedMedias = GuessTheFilter.previousMedias.concat(GuessTheFilter.photos)
			// console.log(combinedMedias	);
			

			// Store already viewed medias in local storag so we don't see them again
			// Set timestamp on medias timestamp: new Date().getTime()
			Utils.store('medias', combinedMedias);

			// If we don't have enough media then request more medias!
			// if (GuessTheFilter.photos.length < 4) {
			// 	GuessTheFilter.fetch();
			// };

			var template = Handlebars.compile( $('#photos-template').html() );

			$('#container').html( template( GuessTheFilter.photos ) );	

		}
		
	},

	/**
	 * [checkAgainstPreviousMedias description]
	 * @param  {[type]} media [description]
	 * @return {[type]}       [description]
	 */
	checkAgainstPreviousMedias: function(media) {
		// console.log(GuessTheFilter.previousMedias);
		
		for (var i = 0; i < GuessTheFilter.previousMedias.length; i++) {

			// If any of the new media objects we've fetched matches an old media object we don't want to push it to the new array
			// console.log(GuessTheFilter.previousMedias[i].media_id)
			// console.log(media.id);
			
			if (GuessTheFilter.previousMedias[i].media_id === media.id) {
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
		var item = items[Math.floor(Math.random()*items.length)];

		// make sure fake filter is not the same as real filter
		if (item !== exceptionItem) {
			return item;
		} else {
			return this.pickRandomFilter(item, exceptionItem);
		}
	},

	/**
	 * [makeFilterSelection description]
	 * @return {[type]} [description]
	 */
	makeFilterSelection: function() {

		if ($(this).data('filter') == GuessTheFilter.currentFilter) {
			GuessTheFilter.curentScore.correctAnswers++;
		};

		GuessTheFilter.curentScore.totalAnswers++;

		GuessTheFilter.updateScore(GuessTheFilter.curentScore.correctAnswers, GuessTheFilter.curentScore.totalAnswers);
		GuessTheFilter.updateMedias($(this).data('direction'));

		if (GuessTheFilter.photos.length < 4) {
			console.log('fetch');
			
			GuessTheFilter.fetch();
		};

	},

	/**
	 * [updateScore description]
	 * @param  {[type]} correctAnswers [description]
	 * @param  {[type]} totalAnswers   [description]
	 * @return {[type]}                [description]
	 */
	updateScore: function(correctAnswers, totalAnswers) {

		var template = Handlebars.compile( $('#score-template').html() );

		$('#score').html( template( GuessTheFilter.curentScore ) );	

		$('#score').addClass('animate-flash');

		setTimeout(function() {
			$('#score').removeClass('animate-flash');
		}, 500);

	},

	/**
	 * [updateMedias description]
	 * @return {[type]} [description]
	 */
	updateMedias: function(direction) {
		// Remove first item
		GuessTheFilter.photos = GuessTheFilter.photos.slice(1);

		console.log(GuessTheFilter.photos);
		

		GuessTheFilter.currentFilter = GuessTheFilter.photos[0].filter;

		console.log(GuessTheFilter.currentFilter);
		
		console.log('removed', $('#container').find('.photo-container:first-child'));

		var $firstChild = $('#container').find('.photo-container:first-child');

		if (direction === 'left') {
			$firstChild.addClass('animate-fly-out-left');
		} else {
			$firstChild.addClass('animate-fly-out-right');
		}

		setTimeout(function() {
			$firstChild.remove();
		}, 200);
		
		



	}
};

(function($) {	

	$(document).ready(function() {
		GuessTheFilter.init();
	});
	
})(jQuery);