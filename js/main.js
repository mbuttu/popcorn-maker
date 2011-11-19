(function() {

  //var rctx = require.config({
  //  baseUrl: "js",
  //  paths: {
  //    context: "popcorn-maker"
  //  }
  //});

  require( [ "js/external" ], function() {

    require( [ "js/popcorn-maker", "butter/src/butter.js" ], function( PopcornMaker ) {

      var pm = new PopcornMaker(),
      appController = window.appController,
      tracks = JSON.parse(appController.tracksAsJSON()),
      idx;

      $(function() {
        $( ".draggable" ).draggable();
      });

      var d = {
        links: {
          position: {
            at: "top right",
            my: "bottom left",
            viewport: $(window)
          }
        },
      };
      //c = $("#contentheader");

      //$('a[title!=""]', c).qtip(d.links);

      pm.createPreview({
        target: "main",
        popcornUrl: "lib/popcorn-complete.js",
        butterUrl: Butter.getScriptLocation() + "butter.js",
        defaultMedia: appController.moviePath,
        template: {
          template: appController.layoutPath
        },
        onload: function( preview ) {
          if ( appController.exportedProject ) {
            console.log("IMPORTING PROJECT");
            //b.clearProject();
            b.importProject( JSON.parse( appController.exportedProject ) );
          }
          else {
            console.log("USE DATA FROM FCP");
            for (idx = 0; idx < tracks.length; idx++) {
              var events = tracks[idx].events;
              var eventIdx;

              var butterTrack = new Butter.Track();
              b.addTrack(butterTrack);

              for (eventIdx = 0; eventIdx < events.length; eventIdx++) {
                var event = events[eventIdx];

                var popcornOptions = {
                  start: event.start,
                  end: event.end
                };

                if ( event.text ) {
                  popcornOptions.text = event.text;
                }

                var butterTrackEvent = new Butter.TrackEvent({
                  type: event.type,
                  popcornOptions: popcornOptions
                });

                butterTrackEvent.track = butterTrack;
                b.addTrackEvent(butterTrack, butterTrackEvent);
              }
            }
          }
        }
      });

      window.addEventListener("DOMContentLoaded", function() {
       
        var pm = new PopcornMaker(),
        appController = window.appController,
        tracks = JSON.parse(appController.tracksAsJSON()),
        idx;

        pm.createPreview({
          target: "main",
          popcornUrl: "lib/popcorn-complete.js",
          butterUrl: Butter.getScriptLocation() + "butter.js",
          defaultMedia: appController.moviePath,
          template: {
            template: appController.layoutPath
          },
          onload: function( preview ) {
            if ( appController.exportedProject ) {
              console.log("IMPORTING PROJECT");
              //b.clearProject();
              b.importProject( JSON.parse( appController.exportedProject ) );
            }
            else {
              console.log("USE DATA FROM FCP");
              for (idx = 0; idx < tracks.length; idx++) {
                var events = tracks[idx].events;
                var eventIdx;

                var butterTrack = new Butter.Track();
                b.addTrack(butterTrack);

                for (eventIdx = 0; eventIdx < events.length; eventIdx++) {
                  var event = events[eventIdx];

                  var popcornOptions = {
                    start: event.start,
                    end: event.end
                  };

                  if ( event.text ) {
                    popcornOptions.text = event.text;
                  }

                  var butterTrackEvent = new Butter.TrackEvent({
                    type: event.type,
                    popcornOptions: popcornOptions
                  });

                  butterTrackEvent.track = butterTrack;
                  b.addTrackEvent(butterTrack, butterTrackEvent);
                }
              }
            }
          }
        });
      }, false);

      $(window).bind("beforeunload", function( event ) {
        return "Are you sure you want to leave Popcorn Maker?";
      });

      $(window).keypress( function( event ) {
        var elem = event.srcElement || event.target;
        if ( (event.which === 46 || event.which === 8) &&
             (elem.nodeName !== "INPUT" && elem.nodeName !== "TEXTAREA") ) {
          event.preventDefault();
        }
      });

    }); //require

  }); //require
})();
