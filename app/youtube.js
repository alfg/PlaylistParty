var config = require("../config");
var cache = require("./cache");
var request = require("request");

function YoutubeService() {}

YoutubeService.prototype.searchYoutube = function (query, callback) {
  var self = this;

  var cacheKey = "searchYoutube_" + query;
  var timeout = 60 * 60 * 24; // 24 hours.

  cache.getOrSet(cacheKey, timeout, searchYoutube, function (data) {
    callback(data);
  });

  function searchYoutube(cb) {
    search(query, cb);
  }
};

function search(query, callback) {
  var self = this;

  var url = "https://www.youtube.com/results?q=" + encodeURIComponent(query);
  var json = { results: [] };

  request(url, function (err, response, html) {
    json["parser"] = "json_format";
    json["key"] = html.match(/"innertubeApiKey":"([^"]*)/)[1];

    var data;
    var sectionLists = [];
    try {
      var match = html.match(/ytInitialData[^{]*(.*?);\s*<\/script>/s);
      if (match && match.length > 1) {
        json["parser"] += ".object_var";
      } else {
        json["parser"] += ".original";
        match = html.match(/ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s);
      }
      data = JSON.parse(match[1]);
      json["estimatedResults"] = data.estimatedResults || "0";
      sectionLists = data.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;
    } catch (ex) {
      console.error("Failed to parse data: ", ex);
    }

    parseJson(sectionLists, json);

    return callback(json.results[0]);
  });
};

function parseJson(contents, json) {
  contents.forEach(function(sectionList) {
    try {
      if (sectionList.hasOwnProperty("itemSectionRenderer")) {
        sectionList.itemSectionRenderer.contents.forEach(function(content) {
          try {
            if (content.hasOwnProperty("videoRenderer")) {
              json.results.push({ id: content.videoRenderer.videoId });
            }
          } catch (ex) {
            console.error("Failed to parse renderer:", ex);
          }
        });
      } else if (sectionList.hasOwnProperty("continuationItemRenderer")) {
        json["nextPageToken"] = sectionList.continuationItemRenderer
          .continuationEndpoint.continuationCommand.token;
      }
    } catch (ex) {
      console.error("Failed to read contents for section list:", ex);
    }
  });
}

module.exports = YoutubeService;
