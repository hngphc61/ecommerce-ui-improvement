# Fundamentals of Web Development, 2nd Edition

## Running Exercises 10.9 and 10.10

Open the HTML files through a local HTTP server (Live Server) or GitHub Pages.
On HTTP, these exercises request the live textbook service:
http://www.randyconnolly.com/funwebdev/services/travel/cities.php

On HTTPS, they request `data/cities.json` from the same site to avoid mixed-content blocking.
This file contains a 53-city snapshot downloaded from the textbook service on 2026-11-17.
The page explicitly identifies the selected data source. Both modes use a real asynchronous
GET request; the bundled snapshot does not update automatically.
### Chapter 10 [JavaScript 3: jQuery], Lab

What You Will Learn
* Extending JavaScript using jQuery
* Manipulating the DOM and handling events using jQuery
* Making asynchronous requests in JavaScript using jQuery
