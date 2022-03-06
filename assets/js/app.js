// Set size of SVG
const svgWidth = 960;
const svgHeight = 620;

// set margins for SVG
const margin = {
  top: 20, 
  right: 40, 
  bottom: 200,
  left: 100
};

// set height and width
let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

// append a div class to the scatter id
let chart = d3.select('.scatter')
  .append('div')
  .classed('chart', true);

// append an svg element to the chart and set size
let svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// create a group for the SVG
let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Set Initial Parameters for X and Y 
let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare';

// Function to select axis based on which label is clicked
function xScale(data, chosenXAxis) {
    //scales
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);

    return xLinearScale;
}
//a function for updating y-scale variable upon click of label
function yScale(data, chosenYAxis) {
  //scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}
//a function for updating the xAxis upon click
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating yAxis variable upon click
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
}

//a function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[chosenXAxis]))
      .attr('cy', data => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}
//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //style based on variable
    //poverty
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

//funtion for updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    //poverty
    if (chosenXAxis === 'poverty') {
      var xLabel = 'Poverty:';
    }
    //income
    else if (chosenXAxis === 'income'){
      var xLabel = 'Median Income:';
    }
    //age
    else {
      var xLabel = 'Age:';
    }
//Y label
  //healthcare
  if (chosenYAxis ==='healthcare') {
    var yLabel = "No Healthcare:"
  }
  else if(chosenYAxis === 'obesity') {
    var yLabel = 'Obesity:';
  }
  //smoking
  else{
    var yLabel = 'Smokers:';
  }

  //create tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
  });

  circlesGroup.call(toolTip);

  //add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
}
//retrieve data
d3.csv('./assets/data/data.csv').then(function(data) {

    console.log(data);
    
    //Parse data
    data.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create linear scales
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    //create x axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append X
    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    //append Y
    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      //.attr
      .call(leftAxis);
    
    //append Circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', 14)
      .attr('opacity', '.5');

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(data)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});

    //create a group for the x axis labels
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty (%)');
      
    var ageLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');  

    var incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

    //create a group for Y labels
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');
    
    //update the toolTip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis event listener
    xLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if (value != chosenXAxis) {

          //replace chosen x with a value
          chosenXAxis = value; 

          //update x for new data
          xLinearScale = xScale(data, chosenXAxis);

          //update x 
          xAxis = renderXAxis(xLinearScale, xAxis);

          //upate circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update text 
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update tooltip
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          //change of classes changes text
          if (chosenXAxis === 'poverty') {
            povertyLabel.classed('active', true).classed('inactive', false);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else if (chosenXAxis === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', true).classed('inactive', false);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', true).classed('inactive', false);
          }
        }
      });
    //y axis lables event listener
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=chosenYAxis) {
            //replace chosenY with value  
            chosenYAxis = value;

            //update Y scale
            yLinearScale = yScale(data, chosenYAxis);

            //update Y axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            //Udate CIRCLES with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update TEXT with new Y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update tooltips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //Change of the classes changes text
            if (chosenYAxis === 'obesity') {
              obesityLabel.classed('active', true).classed('inactive', false);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else if (chosenYAxis === 'smokes') {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', true).classed('inactive', false);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', true).classed('inactive', false);
            }
          }
        });
});

// var svgWidth = 800;
// var svgHeight = 560;

// var margin = {
//     top: 20,
//     right: 40,
//     bottom: 80,
//     left: 50
// };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// // Create an SVG wrapper, append an SVG group that will hold our chart and shift the latter by left and top margins
// var svg = d3
//     .select(".scatter")
//     .append("svg")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight);

// // Append an SVG group
// var chartGroup = svg.append("g")
//     .attr("transform", 'translate(${margin.left}, ${margin.top})');

// d3.csv("assets/data/data.csv", function(data){
//     data.poverty = +data.poverty;
//     data.healthcare = +data.healthcare;
//     return data;
// }).then(function(data) {
//     console.log(data);

// // Create scales
// var xLinearScale = d3.scaleLinear()
//     .domain([8, d3.max(data,function(d){
//     return +d.poverty;
//     })])
//     .range([0, width]);

// var yLinearScale = d3.scaleLinear()
//     .domain([2, d3.max(data,function(d){
//     return +d.healthcare;
//     })])
//     .range([height, 0]);

// // Create axis
// var bottomAxis = d3.axisBottom(xLinearScale);
// var leftAxis = d3.axisLeft(yLinearScale);

// // Adding in bottom and left axis
// chartGroup.append("g")
//     .attr("transform", 'translate(0, ${height}')
//     .call(bottomAxis);
// chartGroup.append("g")
//     .call(leftAxis);

// // Data points
// var circlesGroup = chartGroup.selectAll("circle")
//     .data(data)
//     .enter()
//     .append("circle")
//     .attr("cx", (d,i) => xScale(d.poverty))
//     .attr("cy", d => yScale(d.healthcare))
//     .attr("r", "15")
//     .attr("fill", "blue")
//     .classed("stateCircle", true)

// // State abbreviations
// chartGroup.selectAll("text")
//     .data(data)
//     .enter()
//     .append("text")
//     .attr("x", (d,i) => xScale(d.poverty))
//     .attr("y", d => (yScale(d.healthcare-0.28)))
//     .classed("stateText", true)
//     .text(d => d.abbr)
//     .on("mouseover", function(d) {
//         toolTip.show(d);
//     })
//     .on("mouseout", function(d,i) {
//         toolTip.hide(d);
//     });

// // x labels
// chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 0 - margin.left)
//     .attr("x", 0 - height / 2)
//     .attr("dy", "1em")
//     .classed("aText", true)
//     .attr("data-axis-name", "healthcare")
//     .text("Lacks Healthcare(%)");

// // y labels
// chartGroup.append("text")
//     .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")")
//     .attr("data-axis-name", "poverty")
//     .classed("aText", true)
//     .text("In Poverty (%)");

// // ToolTip
// var toolTip = d3.tip()
//     .attr("class", "tooltip")
//     .offset([-10, 30])
//     .html(function(d) {
//         return ('${d.abbr}<br>Healthcare (%): ${d.healthcare}%<br>Poverty: ${d.poverty}');
//     });


// // Integrate ToolTip into chart
// // chartGroup.call(toolTip);

// // Event listener for display and hide of ToolTip
// circlesGroup.on("mouseover", function(d) {
//     toolTip.show(d);
// })
//     .on("mouseout", function(d, i){
//         toolTip.hide(d);
//     });

// });
// // var svgWidth = 960;
// // var svgHeight = 500;

// // var margin = {
// //   top: 20,
// //   right: 40,
// //   bottom: 80,
// //   left: 100
// // };

// // var width = svgWidth - margin.left - margin.right;
// // var height = svgHeight - margin.top - margin.bottom;

// // var svg = d3
// //   .select(".scatter")
// //   .append("svg")
// //   .attr("width", svgWidth)
// //   .attr("height", svgHeight);

// // // Append an SVG group
// // var chartGroup = svg.append("g")
// //   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// // // Initial Params
// // let chosenXAxis = "poverty";



// // // function used for updating x-scale variable upon click on axis label 
// // function xScale(data, chosenXAxis) {
// //     // create scales
// //     var xLinearScale = d3.scaleLinear()
// //       .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
// //         d3.max(data, d => d[chosenXAxis]) * 1.2
// //       ])
// //       .range([0, width]);
  
// //     return xLinearScale;
  
// //   }

// //   function renderAxes(newXScale, xAxis) {
// //     var bottomAxis = d3.axisBottom(newXScale);
  
// //     xAxis.transition()
// //       .duration(1000)
// //       .call(bottomAxis);
  
// //     return xAxis;
// //   }

// // // function used for updating circles group with a transition to
// // // new circles
// //   function renderCircles(circlesGroup, newXScale, chosenXAxis) {

// //     circlesGroup.transition()
// //       .duration(1000)
// //       .attr("cx", d => newXScale(d[chosenXAxis]));
  
// //     return circlesGroup;
// //   }


// // // function used for updating circles group with new tooltip
// // // function updateToolTip(chosenXAxis, circlesGroup) {

// // //     var label;
  
// // //     if (chosenXAxis === "poverty") {
// // //       label = "In Poverty (%)";
// // //     }
// // //     else {
// // //       label = "Age (Median)";
// // //     }
  
// // //     var toolTip = d3.tip()
// // //       .attr("class", "tooltip")
// // //       .offset([80, -60])
// // //       .html(function(d) {
// // //         return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
// // //       });
  
// // //     circlesGroup.call(toolTip);
  
// // //     circlesGroup.on("mouseover", function(data) {
// // //       toolTip.show(data);
// // //     })
// // //       // onmouseout event
// // //       .on("mouseout", function(data, index) {
// // //         toolTip.hide(data);
// // //       });
  
// // //     return circlesGroup;
// // //   }
  
// //   // Retrieve data from the CSV file and execute everything below
// //   d3.csv("assets/data/data.csv").then(function(data, err) {
// //     if (err) throw err;
  
// //     // parse data
// //     data.forEach(function(data) {
// //       data.poverty = +data.poverty;
// //       data.age = +data.age;
// //       data.income = +data.income;
// //     });
  
// //     // xLinearScale function above csv import
// //     var xLinearScale = xScale(data, chosenXAxis);
  
// //     // Create y scale function
// //     var yLinearScale = d3.scaleLinear()
// //       .domain([0, d3.max(data, d => d.poverty)])
// //       .range([height, 0]);
  
// //     // Create initial axis functions
// //     var bottomAxis = d3.axisBottom(xLinearScale);
// //     var leftAxis = d3.axisLeft(yLinearScale);
  
// //     // append x axis
// //     var xAxis = chartGroup.append("g")
// //       .classed("x-axis", true)
// //       .attr("transform", `translate(0, ${height})`)
// //       .call(bottomAxis);
  
// //     // append y axis
// //     chartGroup.append("g")
// //       .call(leftAxis);
  
// //     // append initial circles
// //     var circlesGroup = chartGroup.selectAll("circle")
// //       .data(data)
// //       .enter()
// //       .append("circle")
// //       .attr("cx", d => xLinearScale(d[chosenXAxis]))
// //       .attr("cy", d => yLinearScale(d.num_hits))
// //       .attr("r", 20)
// //       .attr("fill", "pink")
// //       .attr("opacity", ".5");
  
// //     // Create group for two x-axis labels
// //     var labelsGroup = chartGroup.append("g")
// //       .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
// //     var povertyLabel = labelsGroup.append("text")
// //       .attr("x", 0)
// //       .attr("y", 20)
// //       .attr("value", "poverty") // value to grab for event listener
// //       .classed("active", true)
// //       .text("(Poverty) Hair Metal Ban Hair Length (inches)");
  
// //     var albumsLabel = labelsGroup.append("text")
// //       .attr("x", 0)
// //       .attr("y", 40)
// //       .attr("value", "num_albums") // value to grab for event listener
// //       .classed("inactive", true)
// //       .text("# of Albums Released");
  
// //     // append y axis
// //     chartGroup.append("text")
// //       .attr("transform", "rotate(-90)")
// //       .attr("y", 0 - margin.left)
// //       .attr("x", 0 - (height / 2))
// //       .attr("dy", "1em")
// //       .classed("axis-text", true)
// //       .text("Number of Billboard 500 Hits");
  
// //     // updateToolTip function above csv import
// //     // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
// //     // x axis labels event listener
// //     labelsGroup.selectAll("text")
// //       .on("click", function() {
// //         // get value of selection
// //         var value = d3.select(this).attr("value");
// //         if (value !== chosenXAxis) {
  
// //           // replaces chosenXAxis with value
// //           chosenXAxis = value;
  
// //           // console.log(chosenXAxis)
  
// //           // functions here found above csv import
// //           // updates x scale for new data
// //           xLinearScale = xScale(data, chosenXAxis);
  
// //           // updates x axis with transition
// //           xAxis = renderAxes(xLinearScale, xAxis);
  
// //           // updates circles with new x values
// //           circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
  
// //           // updates tooltips with new info
// //           circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
// //           // changes classes to change bold text
// //           if (chosenXAxis === "num_albums") {
// //             albumsLabel
// //               .classed("active", true)
// //               .classed("inactive", false);
// //             hairLengthLabel
// //               .classed("active", false)
// //               .classed("inactive", true);
// //           }
// //           else {
// //             albumsLabel
// //               .classed("active", false)
// //               .classed("inactive", true);
// //             hairLengthLabel
// //               .classed("active", true)
// //               .classed("inactive", false);
// //           }
// //         }
// //       });
// //   }).catch(function(error) {
// //     console.log(error);
// //   });
  