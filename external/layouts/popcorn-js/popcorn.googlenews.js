// PLUGIN: Google News

(function (Popcorn) {

  var scriptLoaded = false,
      scriptLoading = false,
      callBack     = function( data ) {

        if ( typeof google !== 'undefined' && google.load ) {

          google.load("elements", "1", {packages : ["newsshow"], callback: function() {scriptLoaded = true;}});
        } else {

          setTimeout( function() {

            callBack( data );
          }, 1);
        }
      };

  /**
   * Google News popcorn plug-in 
   * Displays Google News information on a topic in a targeted div.
   * Options parameter will need a start, end and target.
   * Optional parameters are topic. topic defaults to "top stories"
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the content is
   *  appended to, this target element must exist on the DOM
   * Topic is the topic of news articles you want to display.
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .googlenews({
          start:          5,                 // seconds, mandatory
          end:            15,                // seconds, mandatory
          topic:          'oil spill',       // optional
          target:         'newsdiv'        // mandatory
        } )
   *
   */
  Popcorn.plugin( "googlenews" , {

      manifest: {
        about:{
          name:    "Popcorn Google News Plugin",
          version: "0.1",
          author:  "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target   : 'news-container',
          topic     : {elem:'input', type:'text', label:'Topic'}
        }
      },
      _setup : function( options ) {
      
        if ( !scriptLoading ) {

          scriptLoading = true;
          Popcorn.getScript( "http://www.google.com/jsapi", callBack );
        }

        options.container = document.createElement( 'div' );
        var container = document.createElement( 'div' );
        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).appendChild( options.container );
          options.container.appendChild( container );
        }

        var readyCheck = setInterval(function() {
          if ( !scriptLoaded ) {
            return;
          }
          clearInterval( readyCheck );

          options.newsShow = new google.elements.NewsShow( container, {
            format : "300x250",
            queryList : [
              { q: options.topic || "Top Stories" }
            ]
          } );

        }, 5);

        options.container.style.display = "none";

      },
      /**
       * @member googlenews 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ){
        options.container.setAttribute( 'style', 'display:inline' );
      },
      /**
       * @member googlenews 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function( event, options ){
        options.container.setAttribute( 'style', 'display:none' );
      },
      _teardown: function( options ) {
        // google news does not like this, throws an error "a is null"
        // doesn't hurt popcorn, and only happens once
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options.container );
        options.newsShow = null;
      }
  });

})( Popcorn );
