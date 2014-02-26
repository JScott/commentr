# Commentr

This tool allows users to leave comments on live HTML elements. This provides a better way for teams to communicate on pages, both prototype and production.

This is a team communication tool, not a social media tool. It's developed for a team's internal use because I imagine the idea falls apart when too many people are using it.

# Usage

Load up the server with [node](http://nodejs.org/). Add the code from `bookmarklet.js` as a bookmarklet in your browser and run it.

* It doesn't work for HTTPS right now and will throw an alert unless node is hosted on an HTTPS server
* You may need to alter `baseUrl` to reflect where you're hosting the server

# Development

Currently I'm testing with http://api.jquery.com/category/effects/fading/
and compiling the bookmarklet code with http://jsfiddle.net/QMeuV/1/embedded/result/.

## Ideas to extend the base concept
* List all the pages that have comments for a given host
* Browser extensions to count the comments on a page in realtime and toggle the bookmarklet
* Use the database data to do something cool like a dashboard page with the hottests new pages and recent comments
