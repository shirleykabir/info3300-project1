// JSON data
var nodeData;
var occ_json;
var us_median_salary = 59039;
var us_median_occ_salary = {
  1: 96545,
  2: 60853,
  3: 86090,
  4: 66330,
  5: 54520,
  6: 27810
}

var occupations = {
  1: {
    name: "Finance/Business",
    employed: 0,
    median: 0
  },
  2: {
    name: "Medicine/Health/Sciences",
    employed: 0,
    median: 0
  },
  3: {
    name: "Government/Social Work",
    employed: 0,
    median: 0
  },
  4: {
    name: "Engineering/IT",
    employed: 0,
    median: 0
  },
  5: {
    name: "Education",
    employed: 0,
    median: 0
  },
  6: {
    name: "Agriculture",
    employed: 0,
    median: 0
  }
};

var cities = {
  1: {
    name: "Austin, TX",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 50830
  },
  2: {
    name: "Atlanta, GA",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 50720
  },
  3: {
    name: "Boston, MA",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 67930
  },
  4: {
    name: "Chicago, IL",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 54340
  },
  5: {
    name: "Dallas, TX",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 50350
  },
  6: {
    name: "Los Angeles, CA",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 50350
  },
  7: {
    name: "Miami, FL",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 46160
  },
  8: {
    name: "New York, NY",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 63320
  },
  9: {
    name: "Philadelphia, PA",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 53590
  },
  10: {
    name: "San Francisco, CA",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 76160
  },
  11: {
    name: "Seattle, WA",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 61170
  },
  12: {
    name: "Washington, D.C.",
    totalEmp: "0",
    occ: [],
    salaries: [],
    living: 0,
    median: 68880
  }
};

Object.keys(cities).forEach(function(key) {
  cities[key].occ = {
    1: {
      name: "Finance/Business",
      employed: 0
    },
    2: {
      name: "Medicine/Health/Sciences",
      employed: 0
    },
    3: {
      name: "Government/Social Work",
      employed: 0
    },
    4: {
      name: "Engineering/IT",
      employed: 0
    },
    5: {
      name: "Education",
      employed: 0
    },
    6: {
      name: "Agriculture",
      employed: 0
    }
  };

  cities[key].salaries = {
    1: {
      name: "Finance/Business",
      salary: 0
    },
    2: {
      name: "Medicine/Health/Sciences",
      salary: 0
    },
    3: {
      name: "Government/Social Work",
      salary: 0
    },
    4: {
      name: "Engineering/IT",
      salary: 0
    },
    5: {
      name: "Education",
      salary: 0
    },
    6: {
      name: "Agriculture",
      salary: 0
    }
  }

});
queue()
  .defer(d3.json, 'cost_of_living.json')
  .defer(d3.json, 'occupation_salary.json')
  .defer(d3.json, 'actual_occupation.json')
  .await(combineData);

// Used to update cities global variable and pass it onto passIn as a parameter to create visualizations
function combineData(error, cost_of_living, occupation_salary, actual_occupation) {
  if (error) {
    return console.log("error: " + error.responseText);
  }

  cost_of_living.forEach(function(obj) {
    var cityID = obj.CITY;
    var costIndex = obj.COST_OF_LIVING_INDEX;

    cities[cityID].living = costIndex;
  });

  occupation_salary.forEach(function(obj) {
    var occID = obj.OCC_ID;

    for (var i = 1; i <= 12; ++i) {
      cities[i].salaries[occID].salary = obj[i];
    }
  });

  actual_occupation.forEach(function(obj) {
    var cityID = obj.CITY;
    var fieldID = obj.OCCUPATION_FIELD;
    var employment = obj.TOTAL_EMPLOYMENT;

    var org = cities[cityID].occ[fieldID].employed;
    var new_emp = parseInt(org) + employment;
    cities[cityID].occ[fieldID].employed = new_emp.toString();

    var tot = cities[cityID].totalEmp;
    var new_tot = parseInt(tot) + employment;
    cities[cityID].totalEmp = new_tot.toString();

  });
  // for(var u = 0; u < cities.length; u++) {}

  var scaleSalaryRadius = d3.scaleLinear()
    .domain([0, 130340])
    .range([0, 120]);

  //city = i, occupation = j
  //scaledSalary[i][j] returns double that represents how much I should extend the radius from 0->50
  var scaledSalary = new Array();
  for (var city in cities) {
    scaledSalary[city] = new Array();
    for (var occ in cities[city].salaries) {
      scaledSalary[city][occ] = scaleSalaryRadius(cities[city].salaries[occ].salary);
    }
  }
  passIn(cities, scaledSalary);
}

// Develops all of the visualizations
function passIn(data, scaledSal) {
  var cities_updated = data;

  var all_fields = ["", "Finance/Business", "Medicine/Health/Sciences", "Government/Social Work", "Engineering/IT", "Education", "Agriculture"];
  var all_cities = ["", "Austin, TX", "Atlanta, GA", "Boston, MA", "Chicago, IL", "Dallas, TX", "Los Angeles, CA", "Miami, FL", "New York, NY", "Phillidelphia, PA", "San Francisco", "Seattle, WA", "Washington, DC"];

  function getSalary(city, occ) {
    return scaledSal[all_cities.indexOf(city)][all_fields.indexOf(occ)]
  }

  function employmentRatio(city) {
    var occRatio = [];
    // var totalEmployment = cities_updated[city].totalEmp;
    Object.keys(cities_updated[city].occ).forEach(function(occ) {
      occRatio.push(cities_updated[city].occ[occ].employed / parseInt(cities_updated[city].totalEmp));
    });
    return occRatio;
  }

  function generateOccupationChildren(city) {
    var all = employmentRatio(city);
    var children = [];
    var ret;
    var fields = ["Finance/Business", "Medicine/Health/Sciences", "Government/Social Work", "Engineering/IT", "Education", "Agriculture"];
    for (var l = 0; l < fields.length; l++) {
      var pushy = {
        name: fields[l],
        size: all[l]
      };
      children.push(pushy);
    }
    return [children];
  }
  nodeData = {
    "name": "cities",
    "children": [{
      "name": "1st",
      "children": [{
        "name": "New York, NY",
        "children": generateOccupationChildren(8)[0]
      }, {
        "name": "San Francisco",
        "children": generateOccupationChildren(10)[0]
      }]
    }, {
      "name": "2nd",
      "children": [{
        "name": "Washington, DC",
        "children": generateOccupationChildren(12)[0]
      }, {
        "name": "Seattle, WA",
        "children": generateOccupationChildren(11)[0]
      }, {
        "name": "Boston, MA",
        "children": generateOccupationChildren(3)[0]
      }, {
        "name": "Miami, FL",
        "children": generateOccupationChildren(7)[0]
      }]
    }, {
      "name": "3rd",
      "children": [{
        "name": "Phillidelphia, PA",
        "children": generateOccupationChildren(9)[0]
      }, {
        "name": "Los Angeles, CA",
        "children": generateOccupationChildren(6)[0]
      }, {
        "name": "Chicago, IL",
        "children": generateOccupationChildren(4)[0]
      }, {
        "name": "Atlanta, GA",
        "children": generateOccupationChildren(1)[0]
      }]
    }, {
      "name": "4th",
      "children": [{
        "name": "Austin, TX",
        "children": generateOccupationChildren(2)[0]
      }, {
        "name": "Dallas, TX",
        "children": generateOccupationChildren(5)[0]
      }]
    }]
  };
  // Variables
  var width = 900;
  var height = 900;
  var radius = Math.min(width - 300, height - 300) / 2;

  //Colorizes the sunburst
  var color = d3.scaleOrdinal()
    .domain(["New York, NY", "Boston, MA", "San Francisco", "Washington, DC", "Seattle, WA", "Miami, FL", "Phillidelphia, PA", "Los Angeles, CA", "Chicago, IL", "Atlanta, GA", "Austin, TX", "Dallas, TX", "1st", "2nd", "3rd", "4th", "Finance/Business", "Medicine/Health/Sciences", "Government/Social Work", "Engineering/IT", "Education", "Agriculture"])
    .range(['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#011330', '#093477', '#1753B1', '#527EC3', '#447977', '#81BAA1', '#F1C875', '#F68146', '#CB454E', '#644478']);

  // Create primary <g> element
  var svg = d3.select('svg');
  var g = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  // Data strucure to change height, change this.
  var partition = d3.partition()
    .size([2 * Math.PI, radius]);
  // Find data root
  var root = d3.hierarchy(nodeData)
    .sum(function(d) {
      return d.size
    });
  partition(root);
  var x_pts = [];
  var y_pts = [];
  var salaries = [];
  var median_city_sal_starta = [];
  var median_city_sal_enda = [];
  var which_city = [];
  var arc = d3.arc()
    .startAngle(function(d) {
      if (d.depth == 3) {
        // Find starting point of median salary arc
        if (d.data.name == "Finance/Business") {
          median_city_sal_starta.push(d.x0);
          which_city.push(d.parent.data.name);
        }
        // Find ending point of median salary arc
        if (d.data.name == "Agriculture") {
          median_city_sal_enda.push(d.x1);
        }
        // Get x, y coordinates for data points for salary/city/occupation field.
        var r = d.y1 + getSalary(d.parent.data.name, d.data.name);
        var angle = (d.x0 + d.x1) / 2.0;
        x_pts.push(r * Math.cos(angle));
        y_pts.push(r * Math.sin(angle));
        salaries.push(cities_updated[all_cities.indexOf(d.parent.data.name)].salaries[all_fields.indexOf(d.data.name)].salary);
      }
      return d.x0
    })
    .endAngle(function(d) {
      return d.x1
    })
    .innerRadius(function(d) {
      if (d.depth == 1) {
        return d.y0 + 50;
      }
      return d.y0
    })
    .outerRadius(function(d) {
      return d.y1
    });
  // Put it all together
  g.selectAll('path')
    .data(root.descendants())
    .enter().append('path')
    .attr("display", function(d) {
      return d.depth ? null : "none";
    })
    .attr("d", arc)
    .style('stroke', '#fff')
    .style("fill", function(d) {
      return color(d.data.name);
    });

  var occ_colors = ['#447977', '#81BAA1', '#F1C875', '#F68146', '#CB454E', '#644478'];

  var scaleSalaryRadius = d3.scaleLinear()
    .domain([0, 130340])
    .range([0, 120]);

  var g2 = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  var pi = Math.PI;

  for (var y = 0; y < median_city_sal_starta.length; y++) {
    // Borders to make it easier to differentiate b/w cities
    var border = d3.arc()
      .innerRadius(300 + scaleSalaryRadius(us_median_salary) - 50)
      .outerRadius(300 + scaleSalaryRadius(us_median_salary) + 30)
      .startAngle(median_city_sal_starta[y]) //converting from degs to radians
      .endAngle(median_city_sal_starta[y]);
    // Arc for each city's median income
    var arc = d3.arc()
      .innerRadius(300 + scaleSalaryRadius(cities_updated[all_cities.indexOf(which_city[y])].median))
      .outerRadius(300 + scaleSalaryRadius(cities_updated[all_cities.indexOf(which_city[y])].median))
      .startAngle(median_city_sal_starta[y]) //converting from degs to radians
      .endAngle(median_city_sal_enda[y]);
    // Adds it to the group
    g2.append("path")
      .attr("d", border)
      .attr("fill", "#dddddd0a")
      .attr("stroke", "#ddddddaa")
      .attr("stroke-width", "2");

    g2.append("path")
      .attr("d", arc)
      .attr("fill", "#d67cea")
      .attr("stroke", "#d67cea")
      .attr("stroke-width", "2");
  }
  // US Median Circle
  g2.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 300 + scaleSalaryRadius(us_median_salary))
    .attr("fill", "transparent")
    .attr("stroke", "#85bb65")
    .attr("stroke-width", "2");
  // Range for data points - dashed lines
  g2.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 300)
    .attr("fill", "transparent")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "3, 3")
    .attr("stroke-width", "2");
  g2.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 420)
    .attr("fill", "transparent")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "3, 3")
    .attr("stroke-width", "2");
  // Title
  g2.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("font-size", "16pt")
    .text("Ideal Place to Live");
  // For data points
  for (var c = 0; c < x_pts.length; c++) {
    g2.append("circle")
      .attr("cx", x_pts[c])
      .attr("cy", y_pts[c])
      .attr("r", 4)
      .attr("fill", occ_colors[c % 6]);
    g2.append("text")
      .text('$' + Math.round(salaries[c] / 100) / 10 + "K")
      .attr("x", x_pts[c] - 5)
      .attr("y", y_pts[c] - 5)
      .attr("font-size", 10)
      .attr("fill", occ_colors[c % 6]);
  }
}
