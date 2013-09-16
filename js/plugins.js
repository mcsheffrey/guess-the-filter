// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

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

}());

// Place any jQuery/helper plugins in here.
