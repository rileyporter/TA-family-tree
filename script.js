window.onload = function() {
    $("#searchError").css("color", "red");
    $("#searchError").css("font-weight", "bold");
    $("#searchError").css("padding-left", "10px");
    $("#searchError").css("left", ($(window).width() * 0.72) + "px");
    $("#searchError").css("top", ($(window).height() * 0.08) + "px");
    $("#searchError").css("position", "absolute");

    $("#searchArea").css("padding-left", "10px");
    $("#searchArea").css("left", ($(window).width() * 0.72) + "px");
    $("#searchArea").css("top", ($(window).height() * 0.045) + "px");
    $("#searchArea").css("position", "absolute");

    $(".familyFilter").css("padding-left", "10px");
    $(".familyFilter").css("left", ($(window).width() * 0.72) + "px");
    $(".familyFilter").css("top", ($(window).height() * 0.11) + "px");
    $(".familyFilter").css("position", "absolute");

    $("#titleAndDescription").css("width", ($(window).width() * 0.5) + "px");

    var testOutput;
    var filenames = [];
    filenames[0] = "tas_4.csv";
    filenames[1] =  "updated_family_data_au16.csv";
    filenames[2] = "tas_quarters.csv";
    var taColNames = ["id", "f_name", "l_name", "intro_qs", "upper_qs", "net_id", "first_q", "related"];

    var outline = false;
    var tocolor = "fill";
    var towhite = "stroke";
    if (outline) {
      tocolor = "stroke"
      towhite = "fill"
    }

    var focus_node = null, highlight_node = null;
    var text_center = false;
    var highlight_node_color = "#8900CC"; //purple
    var highlight_trans = 0.05;
    var default_node_color = "#ccc";
    var default_link_color = "#888";
    var one42_link = "#FFB20E";
    var one43_link = "#3548FF";
    var one43x_link = "#2AB248";
    var clicked = false;

    function searchNode(path, node, circle, text, parentToChildDirectory, childToParentDirectory) {
        //find the node

        $("#searchError").text("");
        var selectedVal = document.getElementById('search').value;
        selectedVal = selectedVal.toLowerCase();
        if (selectedVal == "") {
          $("#searchError").text("Must provide TA first name and last name.");
        } else {
            var prevLength = node[0].length;
            var selected = node.filter(function (d, i) {
                var name = d['f_name'] + " " + d['l_name'];
                name = name.toLowerCase();
                var boo = name !== selectedVal;
                return boo;
            });

            if (prevLength == selected[0].length) {
              $("#searchError").text("TA not found.");
            } else {
              var searched;
              node.attr("searched", function(d) {
                var name = d['f_name'] + " " + d['l_name'];
                name = name.toLowerCase();
                if (name === selectedVal) {
                  searched = d;
                }
              });

              if (searched != undefined) {
                focus_node = searched;

                var descendantResults = new Set();
                getTraversal(searched, descendantResults, parentToChildDirectory);

                var ancestorResults = new Set();
                getTraversal(searched, ancestorResults, childToParentDirectory);

                exit_highlight(circle, text, path);
                set_focus(searched, circle, text, path, ancestorResults, descendantResults)
                set_highlight(searched, circle, text, path, ancestorResults, descendantResults);
                clicked = true;
                $('#svgContainer').animate({
                  scrollTop: Math.max(0, searched.y - $(window).height() * 0.3)
                }, 500);
              }
            }
        }
    }

    // ================== PARSE CSVs ==================

    parseList(filenames);

    function parseList(filenames){
      var q = queue();
      filenames.forEach(function(d) {
        // add your csv call to the queue
        q.defer(function(callback) {
          d3.text(d,function(datasetText) {
            var parsedRes = d3.csv.parseRows(datasetText);
            callback(null, parsedRes) });
        });
      });

      q.awaitAll(restOfCode)
    }


    // ================== Manipulate data to fit our nodes/links ==================

    // kicked off after all of the csvs have been loaded
    // each csv is loaded into results[i] based on filenames indexing
    function restOfCode(err, results) {
      parsedTACSV = results[0];
      parsedFamilyCSV = results[1];
      quarters = results[2];
      nodes = [];
      links = [];

      // translate each ta into a dictionary and set up the nodes array of these objects
      parsedTACSV.forEach(function(nodeInfo) {
        var nodeDict = {};
        for (var i = 0; i < nodeInfo.length; i++) {
          nodeDict[taColNames[i]] = nodeInfo[i];
        }
        // assign the ta to the node array at their ta_id index
        nodes[nodeInfo[0]] = nodeDict;
      });

      var index = 0;
      for (index = 0; index < nodes.length; index++) {

        if (typeof nodes[index] == 'undefined') {
          // set the indexes in nodes that doesn't have a TA as an empty
          // dictionary where the x and y positioning is off the screen
          nodes[index] = {x:-10, y:-10, fixed:true, charge:-300, related:false};
        }
      }

      var i = 0;
      parsedFamilyCSV.forEach(function (family) {
          var taId = family[4];
          var parentId142 = family[1];
          var parentId143 = family[2];
          var parentId143x = family[5];

          var taNode = nodes[taId];

          if (taNode) {
              taNode.related = true;
          } else {
              console.log(taId);
              console.log(nodes[taId]);
              console.log(nodes);
          }

          if (parentId142 !== "NULL") {
            var link = {source: parseInt(parentId142), target: parseInt(taId), value: 100, type: "onefortytwo"};
            links[i] = link;
            i++;
            nodes[parentId142].related = true;
          }

          if (parentId143 !== "NULL") {
            var link = {source: parseInt(parentId143), target: parseInt(taId), value: 100, type: "onefortythree"};
            links[i] = link;
            i++;
            nodes[parentId143].related = true;
          }

          if (parentId143x !== "NULL") {
            var link = {source: parseInt(parentId143x), target: parseInt(taId), value: 100, type: "onefortythreex"};
            links[i] = link;
            i++;
            nodes[parentId143x].related = true;
          }
      });


    // ================== SET UP variables for force ==================

      width = $(window).width() * 0.95;
      height = $(window).height() * 0.70;

      treeHeight = 0;
      quarterHeight = 0;

      filterNodes(nodes);
      placeNodes(nodes, quarters, width, height);

      var parentToChildDirectory = new Map();
      var childToParentDirectory = new Map();
      links.forEach(function(d) {
          var children = parentToChildDirectory.get(d.source);
          var parents = childToParentDirectory.get(d.target);

          if (children == undefined) {
            children = new Set();
          }
          children.add(d.target);
          parentToChildDirectory.set(d.source,children);

          if (parents == undefined) {
            parents = new Set();
          }
          parents.add(d.source);
          childToParentDirectory.set(d.target,parents);
      });

      // attach everything to the force variable, this is where we link nodes and edges
      var force = d3.layout.force()
          .nodes(nodes)
          .links(links)
          .size([width, height])
          .linkDistance(function(d) {
            d.target.fixed = true;
            d.source.fixed = true;
            return 10 * lineLength(d.source.x, d.source.y, d.target.x, d.target.y);
          })
          .charge(-30)
          .gravity(0)
          .on("tick", function() {
            tick(path, node);
          })
          .start();


      // Set the range
      var v = d3.scale.linear().range([0, 100]);

      // Scale the range of the data
      v.domain([0, d3.max(links, function(d) { return d.value; })]);
      var svgContainer = d3.select("body").append("div")
                                          .attr("id", "svgContainer")
                                          .style("height", height + "px")
                                          .style("width", width + "px")
                                          .style("left", ($(window).width() * 0.02) + "px")
                                          .style("position", "absolute")
                                          .style("overflow-x", "hidden")
                                          .style("overflow-y", "scroll");

      var svg = svgContainer.append("svg")
          .attr("width", width + "px")
          .attr("height", treeHeight + "px");

      drawLines(quarters, svg, 30);

    // the area to zoom
    var rect =  svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");


      // build the arrow.
      svg.append("svg:defs").selectAll("marker")
          .data(["end"])      // Different link/path types can be defined here
          .enter().append("svg:marker")    // This section adds in the arrows
          .attr("id", String)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 22)
          .attr("refY", -1.5)
          .attr("markerWidth", 4)
          .attr("markerHeight", 4)
          .attr("orient", "auto")
        .append("svg:path")
          .attr("d", "M0,-5L10,0L0,5");

      // add the links and the arrows
      var path = svg.append("svg:g").selectAll("path")
          .data(force.links())
          .enter().append("svg:path")
          .attr("class", function(d) { return "link " + d.type; })
          .attr("marker-end", "url(#end)");

      var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
             x = "<strong>Name:</strong> <span class='tooltip-info'>" + d["f_name"] + " " + d["l_name"]+ "</span>";
             x += "</br><strong>Quarters TAing:</strong> <span class='tooltip-info'>" + d["intro_qs"] + "</span>";
             return x;
      })


      // define the nodes
      var node = svg.selectAll(".node")
          .data(force.nodes())
          .enter().append("g")
          .attr("class", "node")
          .on("click", click)
          .on("dblclick", dblclick)
          .call(force.drag);


      // add the nodes
      var circle = node.append("circle")

          //Size based on quarters
         /* .attr("r", function(d) { if (d["intro_qs"] !== undefined) {
                                        return Math.sqrt(d["intro_qs"] + 12);
                                   } else {
                                        return 15;
                                   }
                                }); */
      .attr("r", 13);

      // add the text
      var text = node.append("text")
          .attr("x", function(d) {
             if (d.f_name != undefined) {
              var label = d.f_name + " " + d.l_name;
              return label.length * -2.5;
            }
          })
          .attr("y", 17)
          .attr("dy", ".35em")
          .style("font-size", "10px")
          .text(function(d) {
            if (d.f_name != undefined) {
              return d.f_name + " " + d.l_name;
            } else {
              return "";
            }
          });

      node.call(tip);
      // find family
      node.on("mouseover", function(d) {
        tip.show(d);
        if (!clicked) {
          var descendantResults = new Set();
          getTraversal(d, descendantResults, parentToChildDirectory);

          var ancestorResults = new Set();
          getTraversal(d, ancestorResults, childToParentDirectory);

          set_focus(d, circle, text, path, ancestorResults, descendantResults)
          set_highlight(d, circle, text, path, ancestorResults, descendantResults);
        }
      });

      node.on("mouseout", function(d) {
        if (!clicked) {

              focus_node = null;
              if (highlight_trans<1)
              {

            circle.style("opacity", 1);
            text.style("opacity", 1);
          }
          exit_highlight(circle, text, path);
        }
        tip.hide(d);
      });

      node.on("click", function(d) {
        clicked = true;
        d3.event.stopPropagation();
        focus_node = d;

        var descendantResults = new Set();
        getTraversal(d, descendantResults, parentToChildDirectory);

        var ancestorResults = new Set();
        getTraversal(d, ancestorResults, childToParentDirectory);

        exit_highlight(circle, text, path);
        set_focus(d, circle, text, path, ancestorResults, descendantResults)
        set_highlight(d, circle, text, path, ancestorResults, descendantResults);
      });

      node.on("dblclick", function(d) {
        if (focus_node!==null)
            {
              focus_node = null;
              if (highlight_trans<1)
              {

            circle.style("opacity", 0.7);
            text.style("opacity", 1);
            path.style("opacity", 0.5);
          }
            }

          if (highlight_node === null) {
            exit_highlight(circle, text, path);
          }
          clicked = false;
      });
      $("#searchbutton").click(function () {searchNode(path, node, circle, text, parentToChildDirectory, childToParentDirectory)});

      var elements = document.getElementsByName("familySelection");
      for (var i=0, len=elements.length; i<len; ++i) {
        elements[i].onclick = function() {
            var descendantResults = new Set();
            getTraversal(focus_node, descendantResults, parentToChildDirectory);

            var ancestorResults = new Set();
            getTraversal(focus_node, ancestorResults, childToParentDirectory);

            exit_highlight(circle, text, path);
            set_focus(focus_node, circle, text, path, ancestorResults, descendantResults);

            set_highlight(focus_node, circle, text, path, ancestorResults, descendantResults);
        }
      }

    // Legend/Key drawing
    var startX = 20
    var startY = 0
    var legendSvgContainer = d3.select("div.jumbotron").append("svg")
                                         .attr("width", ($(window).width() * 0.60) + "px")
                                         .attr("height",($(window).height() * 0.35) + "px")
                                         .style("position", "absolute")
                                         .style("top", ($(window).height() * 0.05) + "px")
                                         .style("left", ($(window).width() * 0.48) + "px");

    var svgGL = legendSvgContainer.append("g")
                           .attr("transform", "translate(0, 0)");

    var squareL = svgGL.append("rect")
                             .attr("x", startX)
                             .attr("y", 1)
                             .attr("width", ($(window).width() * 0.15)+ "px")
                             .attr("height", ($(window).width() * 0.09) + "px")
                             .style("stroke", "black")
                             .style("stroke-width", 2)
                             .style("stroke-opacity", "1")
                             .style("fill", "white");

    /*var squareTextL = svgGL.append("text")
                        .attr("x", 150)
                        .attr("y", 40)
                        .style("font-size", "20px")
                        .style("text-anchor", "middle")
                        .text(function(d) { return "Key";});*/


    var lineDataEdge1 = [ { "x": startX + 20,   "y": startY + 30}, {"x": startX + 30,   "y": startY + 40}, {"x": startX + 40, "y": startY + 50}];
    var lineDataEdge2 = [ { "x": startX + 20,   "y": startY + 60}, {"x": startX + 30,   "y": startY + 70}, {"x": startX + 40, "y": startY + 80}];
    var lineDataEdge3 = [ { "x": startX + 20,   "y": startY + 90}, {"x": startX + 30,   "y": startY + 100}, {"x": startX + 40, "y": startY + 110}];


     //This is the accessor function we talked about above
     var lineFunction = d3.svg.line()
                              .x(function(d) { return d.x; })
                              .y(function(d) { return d.y; })
                             .interpolate("linear");


    svgGL.append("path")
          .attr("d", lineFunction(lineDataEdge1))
          .attr("stroke", one42_link)
          .attr("stroke-width", 2);

    svgGL.append("text")
        .attr("x", startX + 70)
        .attr("y", startY + 45)
        .style("font-size", "15px")
        .style("text-anchor", "start")
        .text(function(d) { return "142 Parent TA";});


    svgGL.append("path")
          .attr("d", lineFunction(lineDataEdge2))
          .attr("stroke", one43_link)
          .attr("stroke-width", 2);


    svgGL.append("text")
        .attr("x",startX + 70)
        .attr("y", startY + 75)
        .style("font-size", "15px")
        .style("text-anchor", "start")
        .text(function(d) { return "143 Parent TA";});

    svgGL.append("path")
          .attr("d", lineFunction(lineDataEdge3))
          .attr("stroke", one43x_link)
          .attr("stroke-width", 2);

    svgGL.append("text")
        .attr("x", startX + 70)
        .attr("y", startY + 105)
        .style("font-size", "15px")
        .style("text-anchor", "start")
        .text(function(d) { return "143X Parent TA";});

    }




    // ================== ACTION functions ==================

    // add the curvy lines
    function tick(path, node) {
       path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node.attr("transform", function(d) {
              d.fixed = true;
              return "translate(" + d.x + "," + d.y + ")";
            });
    }

    // action to take on mouse click
    function click() {
        d3.select(this).select("text").transition()
            .duration(750)
            .attr("x", 22)
            .style("fill", "steelblue")
            .style("stroke", "lightsteelblue")
            .style("stroke-width", ".5px")
            .style("font", "20px sans-serif");
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 16)
            .style("fill", "lightsteelblue");
    }

    // action to take on mouse double click
    function dblclick() {
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 6)
            .style("fill", "#ccc");
        d3.select(this).select("text").transition()
            .duration(750)
            .attr("x", 12)
            .style("stroke", "none")
            .style("fill", "black")
            .style("stroke", "none")
            .style("font", "10px sans-serif");
    }


    // ================== PROCESSING functions ==================

    // filters out TA nodes without any family data
    function filterNodes(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].related != true) {
          nodes[i] = {x:-10, y:-10, fixed:true, charge:-300};
        }
      }
    }

    function placeNodes(nodes, quarters, windowHeight, windowWidth) {

      quarterHeight = 50; //windowHeight / (quarters.length + 1);
      var yOffset = 25 + 30;
      // quarter= [quarter id, string name, year]
      quarters.sort(function(t, o) {
        // hack: 'winter' > spring' > 'autumn'
        // order by year first, then by reverse-alphabetical quarter name
        var result = parseInt(t[2]) - parseInt(o[2]);
        if (result == 0) {
          // need to fix 'summer' to 'spring' comparison
          if (t[1] === 'summer' && o[1] === 'spring' ||
              o[1] === 'summer' && t[1] === 'spring') {
            return t[1].localeCompare(o[1]);
          } else {
            return -1 * t[1].localeCompare(o[1]);
          }
        }
        return result;
      });

      // build up mapping of quarter_id -> section of screen
      var quarterMapping = {};
      var nodesPerSection = [];
      var section = 0;
      for (var i = 0; i < quarters.length; i++) {
        quarterMapping[quarters[i][0]] = section;
        nodesPerSection[section] = [];
        section++;
      }
      // go through nodes, assign positioning for y
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].first_q != undefined) {
            var quarter = quarterMapping[nodes[i].first_q];
            nodes[i].y = quarter * quarterHeight + yOffset;
            nodesPerSection[quarter].push(nodes[i]);
        }
      }
      //filterQuarters(quarters, nodesPerSection);

      // some hand coded in offset for rows, so same num rows look different
      // like cookies on a tray :)
      var oddOffset = 20;
      var xOffset = 30; // make room for axis label
      for (var quarter = 0; quarter < nodesPerSection.length; quarter++) {
        var nodesInSection = nodesPerSection[quarter];
        var sectionSize = (width - (2 * xOffset)) / (nodesInSection.length + 1);
        var leftEdge = oddOffset * (quarter % 2) + xOffset + sectionSize;
        for (var i = 0; i < nodesInSection.length; i++) {
          nodesInSection[i].x = sectionSize * i + leftEdge;
        }
      }


      treeHeight = quarters.length * quarterHeight + (2 * yOffset);
    }

    function filterQuarters(quarters, nodesPerSection) {
      for (var quarter = 0; quarter < nodesPerSection.length; quarter++) {
        if (nodesPerSection[quarter] == []) {
          quarters.splice(quarter, 1);
        }
      }
    }

    function drawLines(quarters, svg, yOffset) {
      // label the actual axis as first quarter
      var width = svg[0][0].width.baseVal.value;

      svg.append("text")
          .attr("x", 0)
          .attr("y", 15)
          .text("Quarter Hired")
          .attr("font-size", "15px")
          .attr("fill", "grey")
          .style("font-weight", "bold");

      // label line under axis label
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", yOffset)
        .attr("x2", width)
        .attr("y2", yOffset)
        .attr("stroke-width", 2.5)
        .attr("stroke", "grey")
        .style("opacity", 0.5);

      // quarters = [[id, name, year]]
      for (var i = 0; i < quarters.length; i++) {
        // add axis label
        svg.append("text")
          .attr("x", 0)
          .attr("y", yOffset + quarterHeight * i + 30)
          .text(quarters[i][1] + " "  + quarters[i][2])
          .attr("font-size", "15px")
          .attr("fill", "grey");

        svg.append("line")
          .attr("x1", 0)
          .attr("y1", yOffset + quarterHeight * (i + 1))
          .attr("x2", width)
          .attr("y2", yOffset + quarterHeight * (i + 1))
          .attr("stroke-width", 2)
          .attr("stroke", "grey")
          .style("opacity", 0.2);
      }
    }

    function getTraversal(d, discovered, directory) {
      var stack = [];
      stack.push(d.index);
      var n = stack.pop();
      while (n != undefined) {
        if (!discovered.has(n)) {
          discovered.add(n);
          var childNodes = directory.get(n);
          if (childNodes != undefined) {
            childNodes.forEach(function(cn) {
              stack.push(cn);
            });
          }
        }
        n = stack.pop();
      }

    }

    // highlights/boldens the nodes and edges of just the current family
    function set_highlight(d, circle, text, path, ancestorResults, descendantResults)
    {

      var selections = getCheckedRadioValue("familySelection");

      circle.style("cursor","pointer");
      if (focus_node!==null) d = focus_node;
      highlight_node = d;

      if (highlight_node_color!="white")
      {
          circle.style(towhite, function(o) {
                    if (o.index == d.index) {
                      return highlight_node_color;
                    }

                    if (ancestorResults.has(o.index) || descendantResults.has(o.index)) {
                      return "black";
                    }

                    return "white";
          });
          text.style("font-weight", function(o) {
                    if (ancestorResults.has(o.index) || descendantResults.has(o.index)) {
                      return "bold";
                    }
                    return "normal";
          });
          //path.style("stroke", "#4E4B4F");
      }
    }

    // sets the focus on current family and lowers opacity fo all other nodes and edges
    function set_focus(d, circle, text, path, ancestorResults, descendantResults)
    {


      var selections = getCheckedRadioValue("familySelection");

    if (highlight_trans<1)  {
          circle.style("opacity", function(o) {
                    if ((selections != 1 && ancestorResults.has(o.index)) || (selections != 0 && descendantResults.has(o.index))) {
                      return 1;
                    }
                    return highlight_trans;
                });

          text.style("opacity", function(o) {
                    if ((selections != 1 && ancestorResults.has(o.index)) || (selections != 0 && descendantResults.has(o.index))) {
                      return 1;
                    }
                    return highlight_trans;
                });
          text.style("font-weight", function(o) {
                    if (ancestorResults.has(o.index) || descendantResults.has(o.index)) {
                      return "bold";
                    }
                    return "normal";
          });

          path.style("opacity", function(o) {
              if ((selections != 1 && ancestorResults.has(o.target.index)) || (selections != 0 && descendantResults.has(o.source.index))) {
                  return 1;
                } else {
                  return highlight_trans;
                }
          });

      }
    }

    // removes highlights
    function exit_highlight(circle, text, path)
    {
          circle.style("opacity", "0.70");
          circle.style(towhite, "white");
          circle.style("stroke-width", "3px");
          path.style("stroke", function(d) {
                            if (d.type === "onefortytwo") {
                                return one42_link;
                            } else if (d.type === "onefortythree") {
                                return one43_link;
                            } else {
                                return one43x_link;
                            } });
          path.style("fill", "none");
          path.style("opacity", "0.50");
          path.style("stroke-width:","3.0px");
          text.style("font-weight", "normal");
    }


    // utility functions
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function getCheckedRadioValue(name) {
        var elements = document.getElementsByName(name);
        for (var i=0, len=elements.length; i<len; ++i) {
            if (elements[i].checked) return i;
        }
    }

    function lineLength(x0, y0, x1, y1){
        return Math.sqrt((x0 -= x1) * x0 + (y0 -= y1) * y0);
    };
};
