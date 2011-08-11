(function(){

  window.addEventListener("DOMContentLoaded", function(){
    
    // purposely making b a global variable so that
    // Popcorn Maker FCP has access to it
    b  = new Butter();
    var appController = window.appController,
    tracks = JSON.parse(appController.tracksAsJSON()),
    idx;

    console.log(appController.tracksAsJSON());

    var targetDiv = appController.editorDOMWindow.document.createElement("div");

    targetDiv.id = "me";
    targetDiv.style.width = "400px";
    targetDiv.style.height = "500px";
    targetDiv.style.border = "1px solid black";
    appController.editorDOMWindow.document.body.appendChild(targetDiv);

    b.eventeditor({
      target: targetDiv,
      defaultEditor: "popcorn-maker/lib/defaultEditor.html",
      /*
      editorWidth: "98%",
      editorHeight: "98%"
      */
    });

    b.previewer({
      layout: "layouts/default.html",
      target: "main",
      popcornURL: "lib/popcorn-complete.js",
      media: appController.moviePath,
      callback: function() {
        b.buildPopcorn( b.getCurrentMedia(), function() {
          console.log( appController.exportedProject );
          if ( appController.exportedProject ) {
            console.log("IMPORTING PROJECT");
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

                var butterTrackEvent = new Butter.TrackEvent({
                  type: event.type,
                  popcornOptions: {
                    start: event.start,
                    end: event.end
                  }
                });

                butterTrackEvent.track = butterTrack;
                b.addTrackEvent(butterTrack, butterTrackEvent);
              }
            }
          }
        });
      }
    });
    
    b.plugintray({ target: "plugin-tray", pattern: '<li class="$type_tool"><a href="#" title="$type"><span></span>$type</a></li>' });
    b.addPlugin( { type: "image" } );
    b.addPlugin( { type: "footnote" } );
    b.addPlugin( { type: "twitter" } );
    b.addPlugin( { type: "webpage" } );
    b.addPlugin( { type: "subtitle" } );
    b.addPlugin( { type: "googlenews" } );
    
    b.timeline({ target: "timeline-div"});

    $('.enable-scroll').tinyscrollbar();
    
    b.listen ( "trackeditstarted", function() {
      $('.close-div').fadeOut('fast');
      $('.popupDiv').fadeIn('slow');
      $('#popup-4').show();
      $(' .balck-overlay ').hide();
    });
    
    b.listen ( "trackeditclosed", function() {
      $('.close-div').fadeOut('fast');
      $('.popups').hide(); 
    });

    $(".collapse-btn").toggle(function() {

      $('.collapse-btn a').css('backgroundPosition','6px 7px');
      $(".toolbox").animate({ width: "46px" }, 500);
      $('.collapse-btn a').text("");
      $(".timeline").stop().animate({ paddingRight:'86px'}, 500);
      $(".qtip").hide();

      },function() {

        $('.collapse-btn a').css('backgroundPosition','6px -9px');
        $(".toolbox").animate({ width: "120px" }, 500);
        $('.collapse-btn a').text("collapse"); 
        $(".timeline").stop().animate({ paddingRight:'160px'}, 500);

    });

    $(".hide-timeline a").toggle(function() {

      $(this).css('backgroundPosition','20px -10px');
      $(".hide-timeline").animate({ bottom: '36px' }, 500);
      $("#properties-panel").animate({ height: '38px' }, 500);
      $(this).text("Show Timeline"); 

    },function() {

      $(this).css('backgroundPosition','20px 7px');
      $(this).text("Hide Timeline"); 
      $(".hide-timeline").animate({ bottom: "268px" }, 500);
      $("#properties-panel").animate({ height: "270px" }, 500);
    });

    $(".play-btn a").toggle(function() {
      $(".play-btn a span").css('backgroundPosition','0 -25px');
    },function() {
      $(".play-btn a span").css('backgroundPosition','0 0');
    });

    $(".sound-btn a").toggle(function() {
      $(".sound-btn a span").css('backgroundPosition','0 -16px');
    },function() {
      $(".sound-btn a span").css('backgroundPosition','0 0');
    });

    try {
      $(".websites2").msDropDown();
    } catch(e) {
      alert("Error: "+e.message);
    }

    $('.timeline-heading .edit a').click(function(){
      $('.close-div').fadeOut('fast');
      $('.popupDiv').fadeIn('slow');
      $('#popup-1').show();
      $(' .balck-overlay ').hide();
    });

    $('.layer-btn .edit span').click(function(){
      $('.close-div').fadeOut('fast');
      $('.popupDiv').fadeIn('slow');
      $('#popup-2').show();
      $(' .balck-overlay ').hide();
    });

    $('.p-3').click(function(){
      $('.close-div').fadeOut('fast');
      $('.popupDiv').fadeIn('slow');
      $('#popup-3').show();
      $(' .balck-overlay ').show();
    });
    
    $('.p-timeline-title').click(function(){
      console.log(b.getProjectDetails( "title" ) );
      $('#project-title').val( b.getProjectDetails( "title" ) );
      
      $('.close-div').fadeOut('fast');
      $('.popupDiv').fadeIn('slow');
      $('#popup-project-title').show();
      $('.balck-overlay').hide();
    });
    
    $(".change-title-btn").click( function() {
      var title = $('#project-title').val();
      if ( title.length > 0) {
        b.setProjectDetails("title", title);
        $(".p-timeline-title").html( title );
        $('.close-div').fadeOut('fast');
        $('.popups').hide();
      }
    });

    $('.popup-close-btn, .balck-overlay').click(function(){
      $('.close-div').fadeOut('fast');
      $('.popups').hide();
    });

    $(function(){ $("label").inFieldLabels(); });

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
    },
    c = $("#contentheader");

    $('a[title!=""]', c).qtip(d.links);     

  }, false);
})();

