//from http://coding.smashingmagazine.com/2010/05/23/make-your-own-bookmarklets-with-jquery/

(function(){
  /* HTTPS not currently supported */
  if (window.location.protocol == "https:") {
    /* In order to fix this, this application needs the back-end on an HTTPS server */
    alert("HTTPS pages are currently not supported by Power Bar.");
    return false;
  }

  initMyBookmarklet();

  function initMyBookmarklet() {
    /* Bookmarklet-scope variables */
    var uniqueClassAll = 'all_'+(new Date().getTime());
    var uniqueClassComments = 'comments_'+(new Date().getTime());
    var uniqueClassHighlight = 'highlight_'+(new Date().getTime());
    var uniqueClassUnselect = 'close_'+(new Date().getTime());
    var uniqueClassRemove = 'remove_'+(new Date().getTime());
    var uniqueClassMouseover = 'mouseover_'+(new Date().getTime());
    var restUrl = 'http://localhost:3000/comments/';
    var fontUrl = 'http://localhost:3000/static/tlight-regular-webfont.woff';
    var ioUrl = 'http://localhost:3000/';
    var host = window.location.host;
    var path = window.location.pathname;
    var author = 'Anonymous';
    var socket = io.connect(ioUrl);

    /* Identity helper functions. Shamelessly borrowed from http://www.w3schools.com/js/js_cookies.asp */
    function setCookie(c_name,value,exdays) {
      var exdate=new Date();
      exdate.setDate(exdate.getDate() + exdays);
      var c_value=escape(value) + ((exdays==null) ? '' : '; expires='+exdate.toUTCString());
      document.cookie=c_name + '=' + c_value;
    }
    function getCookie(c_name) {
      var c_value = document.cookie;
      var c_start = c_value.indexOf(' ' + c_name + '=');
      if (c_start == -1) {
        c_start = c_value.indexOf(c_name + '=');
      }
      if (c_start == -1) {
        c_value = null;
      }
      else {
        c_start = c_value.indexOf('=', c_start) + 1;
        var c_end = c_value.indexOf(';', c_start);
        if (c_end == -1) {
          c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
      }
      return c_value;
    }
    function setName() {
      author=getCookie('author');
      if (author!=null && author!='') {
        /*alert('Welcome again ' + author);*/
      }
      else {
        author=prompt('Please enter your name:','');
        if (author!=null && author!='') {
          setCookie('author',author,365);
        }
      }
    }
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

    (window.myBookmarklet = function() {
          /* Grab the user's name */
          setName();
          gSelector = null;
          gIndex = null;

          /* Load in comments */
          jQuery.getJSON(restUrl+host+'/'+encodeURIComponent(path), function(comments) {
            /* Set up base CSS for the bookmarklet */
            var purple = '#49166D';
            var green = '#66CC00';
            $('html, body').css('height','100%');
            var helvetica = '@font-face {font-family: "tlight-regular-webfont";src: url("'+fontUrl+'");}';
            var resetFont = 'color:#000;font-variant:normal;font-style:normal;font-weight:normal;font-size:14px;line-height:20px;font-family: "tlight-regular-webfont", Helvetica, Arial, sans-serif;';
            var resetCss = 'box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;line-height:1em;text-align:left;'+resetFont;
            var baseZIndex = 5000;
            $('head').append('<style type="text/css"> .'+uniqueClassAll+', .'+uniqueClassComments+' { '+resetCss+' } '+helvetica+'</style>');

            /* Set up the Power Bar*/
            var barFont = 'font-size:20px;line-height:1.5em;color:white;';
            var barStyle = 'background:'+purple+';padding:5px;height:30px;width:100%;border:none;';
            var barPositioning = 'z-index:'+(baseZIndex+1)+';position:fixed;bottom:0;left:0;';
            /*var closeStyle = 'float:right;';
            var closeImgStyle= 'width:30px;box-shadow:none;-moz-box-shadow:none;-webkit-box-shadow:none;margin:0;padding:0 10px;';
            var closeUrl = 'http://www.freestockphotos.biz/pictures/15/15108/Illustration+of+a+green+close+button.png';
            var closeButton = '<a style="'+closeStyle+'"><img src="'+closeUrl+'" style="'+closeImgStyle+'"/></a>';
            */var powerBar = '<div class="'+uniqueClassAll+'" style="'+barFont+barStyle+barPositioning+'">'+author+'\'s Power Bar</div>';
            $('body').append(powerBar);
            /*$('a').click(function(event) {
              $('.'+uniqueClassAll).remove();
            });*/

            /* Add a button to unload the Power Bar */

            /* Highlight any element with a comment on them */
            var highlightColor = 'red';
            var selectedHighlightColor = 'blue';
            function changeHighlightColor(selector, index, color) {
              $('div[data-selector="'+selector+'"][data-index="'+index+'"]').css('border-color', color);
            }
            function highlightElement(selector, index) {
              /* TODO: check if it's already highlighted first and don't make it if it is */

              var color = matchesSelectedElement(selector, index) ? selectedHighlightColor : highlightColor;
              var element = $($(selector)[index]);
              var offset = element.offset();
              if (offset) { /* Hidden elements aren't in the rendering tree */
                var highlightBoxPositioning = 'z-index:'+(baseZIndex-1)+';position:absolute;top:'+offset.top+'px;left:'+offset.left+'px;height:'+element.height()+'px;width:'+element.width()+'px;';
                var highlightBoxStyle = 'border:5px solid '+color+';margin:-5px;';
                var highlightBox = '<div data-index="'+index+'" data-selector="'+selector+'" class="'+uniqueClassAll+" "+uniqueClassHighlight+'"" style="'+highlightBoxPositioning+highlightBoxStyle+'">&nbsp;</div>';
                var removeButtonStyle= 'width:30px;height:30px;position:relative;bottom:20px;float:right;left:20px;';
                var removeButton ='<img style="'+removeButtonStyle+'" src="https://cdn4.iconfinder.com/data/icons/brightmix/128/monotone_close_exit_delete.png" class="'+uniqueClassRemove+' '+uniqueClassAll+'"></img>';
                $('body').append($(highlightBox).append(removeButton));
              }
            }
            function unhighlightElement(selector, index) {
              /* Note: Just removes highlighting and assumes the comments are already dealt with */
              $('div[data-selector="'+selector+'"][data-index="'+index+'"]').remove();
            }
            function highlightCommentedElements() {
              /* Remove all previous elements */
              $("."+uniqueClassHighlight).remove();
              /* And re-add them */
              var uniqueElements = [];
              jQuery.each(comments, function(index, comment) {
                var elementId = ''+comment.index+comment.selector;
                /* Highlight each element once */
                if (uniqueElements.indexOf(elementId) == -1) {
                  uniqueElements.push(elementId);
                  highlightElement(comment.selector, comment.index);
                }
              });
            }
            highlightCommentedElements();

            /* Set up comment area */
            var commentFont = 'font-size:14px;font-family:Helvetica;line-height:1.5em;';
            var commentStyle = 'background:white;padding:5px;height:300px;width:350px;border:2px solid #595859;';
            var commentPositioning = 'position:absolute;z-index:'+baseZIndex+';'/*z-index:1000;position:fixed;bottom:40px;right:0;';*/
            var commentZone = '<div class="'+uniqueClassAll+'" style="'+commentFont+commentStyle+commentPositioning+'"><div style="overflow-y:scroll;height:275px;" class="'+uniqueClassAll+' '+uniqueClassComments+'"></div></div>';
            var unselectButtonStyle= 'width:30px;height:30px;position:relative;bottom:295px;float:right;left:20px;';
            var unselectButton = '<img style="'+unselectButtonStyle+'" src="https://cdn4.iconfinder.com/data/icons/brightmix/128/monotone_close_exit_delete.png" class="'+uniqueClassUnselect+' '+uniqueClassAll+'"></img>';
            var zone = $(commentZone).append(unselectButton);
            var commentInner = zone.find('.'+uniqueClassComments);
            function generateComment(author, text) {
              var scrubbedText = text.replace(/<[^>]*>/g, '');
              return '<p style="margin:5px 0;padding:0;" class="'+uniqueClassAll+" "+uniqueClassComments+'"><span style="color:'+purple+'">'+author+'</span>: '+scrubbedText+'</p>';
            }
            $('body').append(zone);
            zone.hide();

            /* Fetch the initial comments and add them to the comment zone */
            function matchesSelectedElement(selector, index) {
              return (selector == gSelector && index == gIndex);
            }
            function showCommentsFor(selector, index) {
              var text = '';
              var selectedComments = comments.filter(function(x) { return matchesSelectedElement(x.selector, x.index); });
              jQuery.each(selectedComments, function(index, comment) {
                text += generateComment(comment.author, comment.text);
              });
              commentInner.html(text);
              zone.find('.'+uniqueClassComments).scrollTop(commentInner.prop('scrollHeight'));
            }

            /* Add a form for new comments */
            /* Warning: No URL hash/query support */
            var inputStyle = 'min-height:100%;height:100%;width:100%;padding:0;margin:0;box-sizing:border-box;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;';
            var formStyle = 'width:100%;position:absolute;bottom:0;left:0;height:30px;';
            var input = $('<input style="'+inputStyle+'" class="'+uniqueClassAll+'" type="text" name="text" autocomplete="off">');
            var form = $('<form style="'+formStyle+'" action="" class="'+uniqueClassAll+'"></form>').append(input);
            zone.append(form);

            /* Grab element and index */
            function unselectElement() {
              /* Change highlight back */
              changeHighlightColor(gSelector, gIndex, highlightColor);
              gSelector = null;
              gIndex = null;
              zone.slideUp('fast');
            }
            function selectElement(selector, index) {
              if (!matchesSelectedElement(selector, index)) {
                /* Unselect old element */
                changeHighlightColor(gSelector, gIndex, highlightColor);
                zone.slideUp('fast', function() {
                  /* Change global element */
                  gSelector = selector;
                  gIndex = index;
                  showCommentsFor(selector, index);
                  /* Put the comment box in the new place and show it */
                  var element = $(selector)[index];
                  if ($(element).offset()) { /* Exists in the DOM tree */
                    zone.css('top', ($(element).offset().top+$(element).height())+"px");
                    zone.css('left', $(element).offset().left+"px");
                    zone.slideDown('fast', function() {
                      zone.css("overflow","visible");
                      input.focus();
                    });
                  }
                  /* Change highlight color */
                  changeHighlightColor(selector, index, selectedHighlightColor);
                });
              }
            }

            /* Light highlight for mouseover elements */
            /*$('*:not(.'+uniqueClassAll+')').mouseover(function() {
              var mouseoverPositioning = 'z-index:'+(baseZIndex-1)+';position:relative;bottom:'+0+'px;left:'+0+'px;height:'+$(this).height()+'px;width:'+$(this).width()+'px;';
              var mouseoverStyle = 'background-color:blue;';
              $(this).append('<div style="'+mouseoverStyle+' '+mouseoverPositioning+'" class="'+uniqueClassMouseover+'"">&nbsp;</div>');
            });
            $('*:not(.'+uniqueClassAll+')').mouseout(function() {
              $(this).children('.'+uniqueClassMouseover).remove();
            });*/

            $(document).ready(function() {
              /* Prevent links from working so we can comment on them */
              $('a').click( function(e) { e.preventDefault(); });

              /* General click functionality on... */
              $(document).on('click', function(event) {
                /* Non-bookmarklet targets */
                if (!$(event.target).hasClass(uniqueClassAll)) {
                  if (event.target.tagName.toUpperCase() == 'BODY') {
                    unselectElement();
                  }
                  else {
                    var target = event.target;
                    /* Set the selector, index, and its comments */
                    var s = getSelector(target);
                    selectElement(s[1], s[0]);
                  }
                }
                /* Highlight targets */
                else if ($(event.target).hasClass(uniqueClassHighlight)) {
                  selectElement($(event.target).attr('data-selector'), $(event.target).attr('data-index'));
                }
                /* Close button target */
                else if ($(event.target).hasClass(uniqueClassUnselect)) {
                  unselectElement();
                }
                /* Remove button target */
                else if ($(event.target).hasClass(uniqueClassRemove)) {
                  if (window.confirm("Are you sure you want to permanently remove *all* the comments for this element?")) {
                    var query = {
                      host: host,
                      path: path,
                      selector: $(event.target).parent().attr('data-selector'),
                      index: $(event.target).parent().attr('data-index')
                    };
                    socket.emit('remove', query);
                  }
                }
              });
            });

            /* Redraw when the elements move around */
            $(window).resize( function() {
              var element = $(gSelector)[gIndex];
              if ($(element).offset()) { /* If comment box visible */
                zone.css('top', ($(element).offset().top+$(element).height())+"px");
                zone.css('left', $(element).offset().left+"px");
              }
              highlightCommentedElements();
            });

            /* Make sure our form uses AJAX instead of the default behaviour */
            $(document).on('submit', form, function(event) {
              event.preventDefault();
              var text = input.val();
              if (text != '') {
                var item = {
                  host:host,
                  path:path,
                  selector:gSelector,
                  index:gIndex,
                  author:author,
                  text:text
                }
                socket.emit('comment', item);
                input.val('');
                input.focus();
              }
            });

            /* * *
            * Use socket.io to update comments in real time
            * * */

            /* Add comments */
            socket.on(host+path+'add', function(comment) {
              /* Put this comment in our local collection */
              comments.push(comment);
              /* If it's the element we're on, attach the comment instead of making a new showCommentsFor call */
              if (matchesSelectedElement(comment.selector, comment.index)) {
                var scrolledToBottom = (commentInner.scrollTop()+commentInner.innerHeight() >= commentInner.prop('scrollHeight'));
                commentInner.append(generateComment(comment.author, comment.text));
                if (scrolledToBottom) zone.find('.'+uniqueClassComments).animate({scrollTop:commentInner.prop('scrollHeight')}, 1000);
              }
              /* Make sure there's a highlight on the element */
              highlightElement(comment.selector, comment.index);
            });

            /* Remove comments */
            socket.on(host+path+'remove', function(query) {
              /* Remove comments from local collection */
              comments = comments.filter(function(x) { return !(query.selector == x.selector && query.index == x.index); });
              /* If it's the element we're on, unselect it */
              if (matchesSelectedElement(query.selector, query.index)) {
                unselectElement();
              }
              /* Remove element highlighting */
              unhighlightElement(query.selector, query.index);
            });
          });
    })();
  }

})();
