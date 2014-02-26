//from http://coding.smashingmagazine.com/2010/05/23/make-your-own-bookmarklets-with-jquery/

(function(){

  // the minimum version of jQuery we want
  var v = "1.8";

  // check prior inclusion and version
  if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
    var done = false;
    var script = document.createElement("script");
    script.src = "//ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
    script.onload = script.onreadystatechange = function(){
      if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
        done = true;
        initMyBookmarklet();
      }
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    initMyBookmarklet();
  }

  function initMyBookmarklet() {
    var uniqueClass = "commentr_"+(new Date().getTime());

    function getSelector(object) {
      if (object instanceof jQuery) {
        return "Incorrectly passed in a list of objects";
      }

      /* Get selector */
      object = $(object)
      var selector = object.parents()
        .map(function() { return this.tagName; })
        .get().reverse().join(" ");

      if (selector) {
        selector += " "+ object[0].nodeName;
      }

      var id = object.attr("id");
      if (id) {
        selector += "#"+ id;
      }

      var classNames = object.attr("class");
      if (classNames) {
        selector += "." + $.trim(classNames).replace(/\s/gi, ".");
      }

      /* Get index */
      var index = 0;
      jQuery.each($(selector), function(i, obj) {
        if ($(obj).html() == $(object).html()) { /* replace with .is() ? */
          index = i;
        }
      });

      return [index, selector];
    }

    function createCommentForm(element, index, author) {
      /* Warning: No URL hash/query support */
      var fields = "<input class='"+uniqueClass+"' type='hidden' name='host' value='"+window.location.host+"'>";
      fields += "<input class='"+uniqueClass+"' type='hidden' name='path' value='"+window.location.pathname+"'>";
      fields += "<input class='"+uniqueClass+"' type='hidden' name='element' value='"+element+"'>";
      fields += "<input class='"+uniqueClass+"' type='hidden' name='index' value='"+index+"'>";
      fields += "<input class='"+uniqueClass+"' type='hidden' name='author' value='"+author+"'>";
      fields += "<input class='"+uniqueClass+"' type='text' name='text'>";
      var submitButton = "<input class='"+uniqueClass+"' type='submit' value='Submit'>";
      return "<p class='"+uniqueClass+"'>Add a comment for "+element+":</p><form method='post' action='http://localhost:3000/comments' class='"+uniqueClass+"'>"+fields+submitButton+"</form>";
    }

    (window.myBookmarklet = function() {
          var restUrl = "http://localhost:3000/comments/";
          var host = window.location.host;
          var path = encodeURIComponent(window.location.pathname);

          /* Load in comments */
          jQuery.getJSON(restUrl+host+"/"+path, function(comments) {
            /* Set up comment area */
            var commentFont = "font-size:14px;font-family:Helvetica;line-height:1.5em;";
            var commentStyle = "background:white;overflow-y:scroll;padding:5px;height:150px;background:white;width:100%;border-top:2px solid black;";
            var commentPositioning = "z-index:1000;position:fixed;bottom:0;left:0;";
            var commentZone = "<div class='"+uniqueClass+"' style='"+commentStyle+commentFont+commentPositioning+"'>Click on a bubble to read the comments.</div>";
            $("body, html").css("height","100%");
            var zone = $(commentZone);
            $("body").append(zone);

            /* Create collections of comments by element */
            commentsByElement = {};
            jQuery.each(comments, function(index, comment) {
              if (comment.element in commentsByElement)
                commentsByElement[comment.element] = commentsByElement[comment.element].concat(comment);
              else
                commentsByElement[comment.element] = [comment];
            });

            /* Turn off all links and create a comment when item is clicked */
            $('a').click( function(e) { e.preventDefault(); });
            $(document).click( function(event) {
              if (!$('.'+uniqueClass).is(event.target)) {
                var s = getSelector(event.target);
                zone.html(createCommentForm(s[1], s[0], "Anonymous"));
              }
            });

            /* Make all elements highlight when hovered over */
            /*var uniqueHoverClass = uniqueClass+"_hover";
            $("*").hover( function(event) {
              if (!$('.'+uniqueClass).is(event.target)) {
                $(event.target).addClass(uniqueHoverClass);
              }
            }, function(event) {
              $(event.target).removeClass(uniqueHoverClass);
            });
            $("head").append("<script type='text/css'> ."+uniqueHoverClass+" { background-color:#ff0000; } </script>");*/

            /* Create comment bubbles that display their comment list when clicked */
            var imgHeight = "30px";
            var imgWidth = "30px";
            var bubbleStyle = "cursor:pointer;width:"+imgWidth+";height:"+imgHeight+";";
            var imgUrl = "http://icons.iconarchive.com/icons/deleket/sleek-xp-basic/256/Text-Bubble-icon.png";
            jQuery.each(commentsByElement, function(index, commentList) {
              var first = commentList[0];
              element = $($(first.element)[first.index]);
              var height = element.height() + "px";
              var bubblePosition = "position:absolute;top:"+height+";z-index:1000;";
              var bubble = "<div class='"+uniqueClass+"' style='"+bubblePosition+"'><img class='"+uniqueClass+"' src='"+imgUrl+"' style='"+bubbleStyle+"'/></div>";
              var tag = element.append(bubble);
              tag.click(function() {
                var text = "<div class='"+uniqueClass+"'>";
                jQuery.each(commentList, function(index, comment) {
                  var scrubbedText = comment.text.replace(/<[^>]*>/g, "");
                  text += "Author: "+comment.author+"<br>"+scrubbedText+"<hr>";
                });
                text += "</div>";
                zone.html(text+createCommentForm(first.element, first.index, "Anonymous"));
              });
            });
          });
    })();
  }

})();
