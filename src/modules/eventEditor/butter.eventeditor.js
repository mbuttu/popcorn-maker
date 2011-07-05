/**
  Butter.js Event Editor Module API
  Author: Christopher De Cairos
**/

(function( window, document, undefined, Butter ) {

  Butter.registerModule( "eventeditor", (function() {
    var editorTarget,
      
      toggleVisibility = function( attr ) {

        if ( editorTarget && attr ) {
          editorTarget.style.visibility = attr;
        }
      },

      useCustomEditor = function() {
        //use a custom editor
      },
      // call when no custom editor markup/source has been provided
      constructDefaultEditor = function( trackEvent, manifest ) {

        var options = manifest.options,
          prop,
          opt,
          elemType,
          elemLabel,
          elem,
          label;

        //set-up UI:
        for ( prop in options ) {

          opt = options[ prop ];
          if ( typeof opt === "object" && prop !== "target-object" ) {

            elemType = opt.elem;
            elemLabel = opt.label;

            elem = document.createElement( elemType );
            elem.setAttribute( "className", "butter-editor-element" );

            label = document.createElement( "label" );
            label.setAttribute( "for", elemLabel );
            label.setAttribute( "text", elemLabel );

            if ( elemType === "input" ) {

              var rounded = trackEvent.options[ prop ];

              //  Round displayed times to nearest quarter of a second
              if ( typeof +rounded === "number" && [ "start", "end" ].indexOf( prop ) > -1 ) {

                rounded = Math.round( rounded * 4 ) / 4;
              }

              elem.setAttribute( "value", rounded );
            }

            if ( elemType === "select" ) {

              opt.options.forEach( function( type ) {

                var selectItem = document.createElement( "option" );
                selectItem.setAttribute( "value", type );
                selectItem.setAttribute( "text", type.charAt( 0 ).toUpperCase() + type.substring( 1 ).toLowerCase() );
                elem.appendChild( selectItem );
              });
            }

            label.appendChild( elem );
            editorTarget.appendChild( label );

            toggleVisibility( "visible" );

          }
        }

        //when submit is pressed, call applyChanges( newTrackEvent );

        //if delete pressed call deleteTrack( TrackEvent );

        //if cancel pressed call cancelEdit();
      },

      cancelEdit = function() {

        closeEditor();
      },

      deleteTrack =  function( trackEvent ) {

        Butter.removeTrackEvent( trackEvent );
        closeEditor();
      },

      closeEditor = function() {

        while ( editorTarget.firstChild ) {
          editorTarget.removeChild( editorTarget.firstChild );
        }

        toggleVisibility( "hidden" );
      },

      updateTrackData = function( trackEvent ) {
        // update information in the editor if a track changes on the timeline.
      },

      applyChanges = function( trackEvent ) {

        Butter.trackEventChanged( trackEvent );
        closeEditor();
      },

      beginEditing = function( trackEvent, manifest ) {

        //console.log("beginEditing");
        //console.log(trackEvent);
        //console.log(manifest);
        manifest = manifest || {};

        if ( !manifest ) {

          return;
        }

        if ( !manifest.customEditor ) {

          constructDefaultEditor( trackEvent, manifest );
        } else {

          useCustomEditor()
        }

      };
  
    return { 
      setup: function() {
    
        this.listen ( "trackeventremoved", function( trackEvent ) {

          closeEditor();
        });

        this.listen ( "trackeventchanged", function( trackEvent ) {

          updateTrackData( trackEvent );
        });

        this.listen ( "editTrackEvent", function( options ) {

          beginEditing( options.trackEvent, options.manifest );
        });

      },
      extend: {
        
        setEditorTarget: function( target ) {
          if (target) {
            editorTarget = document.getElementById( target );
          }
        }
      }
    }
  })());

})( window, document, undefined, Butter );

