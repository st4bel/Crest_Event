// ==UserScript==
// @name        Crest_Event
// @namespace   de.die-staemme
// @version     0.1
// @description For the crest event in *.die-staemme.de
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @match       https://*.die-staemme.de/game.php?
// @include     https://*.die-staemme.de/game.php?*screen=event_crest*
// @copyright   2016+, the stabel, git
// @downloadURL -
// ==/UserScript==

var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;
$(function(){
  var storage = localStorage;
  var storagePrefix="Wappen_";
  //Speicherfunktionen
  function storageGet(key,defaultValue) {
      var value= storage.getItem(storagePrefix+key);
      return (value === undefined || value === null) ? defaultValue : value;
  }
  function storageSet(key,val) {
      storage.setItem(storagePrefix+key,val);
  }
  storageSet("running",storageGet("running","true"));

  var running = storageGet("running")==="true";
  init_UI();
  (function startrun(){
    if(!running){
      console.log("EVENT_SCRIPT not Running!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      return;
    }
    var table   = $("#challenge_table");
    var rows 	= $("tr",table).slice(1);
    var row;
    var current = -1;
    (function tick(){
      current++;
      console.log("row #"+current);
      row = rows[current];
      var wappen = $("td",row).eq(1).text().replace(/\s/g,"");
      var link = $("a.btn",row).attr("href");
      if(link!==undefined&&getCrests(row)[wappen]<5){
        location.href = link;
      }
      var text = $("td",row).last().text();
      if(text.indexOf("Keine Champions mehr verfügbar")!=-1){
        console.log("no Champions");
        return;
      }
      setTimeout(function(){
        tick();
      },percentage_randomInterval(2000,5));
    })();
    console.log("waiting...");
    setTimeout(function(){
      startrun();
    },percentage_randomInterval(10*60*1000,5));//alle zehn minuten neustarten
  })();
  function getCrests(){
    var counter = {};
    $("div.crest-container").each(function(){
      var this_crst = $(this);
      var name = $("h4",this_crst).text();
      var class_crest = $("div.crest",this_crst).attr("class");
      counter[name] = parseInt(class_crest.substring(class_crest.indexOf("crest-count-")+12,class_crest.length));
    });
    return counter;
  }

  function init_UI(){
    var headline = $("h2").first();

    $("<button>").text("Start/Stop").click(function(){
        toggleRunning();
    }).appendTo(headline);

    var status_symbol = $("<span>")
    .attr("title","Status")
    .attr("id","status_symbol")
    .attr("class",getSymbolStatus())
    .appendTo(headline);


    function toggleRunning(){
        var running = storageGet("running");
        running = ""+(running==="false");
        console.log("running set to "+running);
        storageSet("running",running);
        location.reload();
    }
    function getSymbolStatus(){
        if(storageGet("running")==="true"){
            return "icon friend online";
        }else{
            return "icon friend offline";
        }
    }
  }
  function randomInterval(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function percentage_randomInterval(average,deviation){
    average=parseInt(average);
    deviation = deviation > 100 ? 1 : deviation/100;
    return randomInterval(average*(1+deviation),average*(1-deviation));
  }
  function getPageAttribute(attribute){
      //gibt die php-Attribute zurück, also z.B. von* /game.php?*&screen=report* würde er "report" wiedergeben
      //return: String, wenn nicht vorhanden gibt es eine "0" zurück
      var params = document.location.search;
      var value = params.substring(params.indexOf(attribute+"=")+attribute.length+1,params.indexOf("&",params.indexOf(attribute+"=")) != -1 ? params.indexOf("&",params.indexOf(attribute+"=")) : params.length);
      return params.indexOf(attribute+"=")!=-1 ? value : "0";
  }
});
