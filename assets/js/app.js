// Set size of SVG
const svgWidth = 960;
const svgHeight = 620;

// Set margins for SVG
const margin = {
  top: 20, 
  right: 40, 
  bottom: 200,
  left: 100
};

// Set height and width
const width = svgWidth - margin.right - margin.left;
const height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append an SVG group that holds chart and shift chart margins
const svg = d3.select('.scatter')
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Create a group for the SVG
const chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Set Initial Parameters for X and Y 
let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare';
  
// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);
    return xLinearScale;
}

// ------------------------------------

// Function for updating y-scale variable when label is clicked
function yScale(data, chosenYAxis) {
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}
// Function for updating the x axis
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// Function for updating Y axis
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// Function that updates circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr('cx', data => newXScale(data[chosenXAxis]))
      .attr('cy', data => newYScale(data[chosenYAxis]))
    return circlesGroup;
}

// Functiion that updates state labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));
    return textGroup
}

// Function for setting values in tooltip
function valueX(value, chosenXAxis) {
    //vale based on variable
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

// Function for updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // overty
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
        return (`${d.state}<br>${xLabel} ${valueX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
  });

  circlesGroup.call(toolTip);

  // onmouseout event
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
}
// Retrieve data from CSV file and execute code
d3.csv('./assets/data/data.csv').then(function(data) {

   
    // Parse data
    data.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Create x and y linear scales 
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      .call(leftAxis);
    
    // Append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', 14)
      .attr('opacity', '.5');

    // Append Initial Text
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

    // Create group for  x axis labels
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
    
    // Update Tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X Axis event listener
    xLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if (value != chosenXAxis) {

          // Replace X with a value
          chosenXAxis = value; 

          // Updates x for new data
          xLinearScale = xScale(data, chosenXAxis);

          // Updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // Updates circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Udates Text
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Updates Tooltip 
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Change of classes to change text depending on selection
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
    // Y Axis event listener
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=chosenYAxis) {
            // Replace y 
            chosenYAxis = value;

            // Update Y scale
            yLinearScale = yScale(data, chosenYAxis);

            // Update Y Axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            // Update circles with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update text with new x
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update tooltip
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Change of classes to change text depending on selection
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
