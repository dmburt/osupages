// TOY: Pachinko
// A version of Mike Bostock's "Pachinko Simulator" that works outside of Observable.
// https://observablehq.com/@mbostock/pachinko-simulator
// 
// D. M. Burt: 8/26/2022


var dists = {Select: {dist_fn: d3.randomNormal(0,1),  dist_n: 10, dist_x_domain: [-10, 10], dist_name: "Normal", description: "No selection made"},
             Normal: {dist_fn: d3.randomNormal(0,3),  dist_n: 2000, dist_x_domain: [-10, 10], dist_name: "Normal", description: "Normal (μ:0, σ: 3)"},
             Cauchy: {dist_fn: d3.randomCauchy(-1,10), dist_n: 1500, dist_x_domain: [-30, 30], dist_name: "Cauchy", description: "Cauchy (μ:-1, σ: 10)"},
             Poisson: {dist_fn: d3.randomPoisson(Math.pow(6,0.8)), dist_n: 400,  dist_x_domain: [-1, 15], dist_name: "Poisson", description: "Poisson (k: 6, λ: 0.8)"},
             Exponential: {dist_fn: d3.randomExponential(0.5),      dist_n: 1000, dist_x_domain: [-1, 10], dist_name: "Exponential", description: "Exponential (λ: 0.5)"},
             Gamma: {dist_fn: d3.randomGamma(2.5,1.5),              dist_n: 1000, dist_x_domain: [-1, 10], dist_name: "Gamma", description: "Gamma (α:2.5, β:1.5)"},
             Binomial: {dist_fn: d3.randomBinomial(20,0.9),         dist_n: 300,  dist_x_domain: [-1, 25], dist_name: "Binomial", description: "Binomial (n:20, p:0.9)"},
             Beta: {dist_fn: d3.randomBeta(50,10),         dist_n: 1000,  dist_x_domain: [0, 1], dist_name: "Beta", description: "Beta (α:50, β:10)"}
}

var dist_selected = dists.Normal;  //set default
var random = dist_selected.dist_fn;
n = dist_selected.dist_n;
x_domain = dist_selected.dist_x_domain;




function* gen() {
     
    const width = document.getElementById('section-stats').offsetWidth * .8;
    const height = width;
    const radius = 2;
    const dodge = dodger(radius * 2 + 1);
    const margin = { top: 0, right: 10, bottom: 10, left: 10 };

    const values = Float64Array.from({ length: n }, random);

    //var x = d3.scaleLinear(d3.extent(values), [
    //  margin.left,
    //  width - margin.right
    //]);
    const svg = d3
      .select("#modal-pachinko-svg")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

                           
    
    var x = d3.scaleLinear()
      .domain(x_domain)
      .range([ 0, width ])
    
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));


    function dodger(radius) {
      const radius2 = radius ** 2;
      const bisect = d3.bisector(d => d.x);
      const circles = [];

      return function(x) {
        const l = bisect.left(circles, x - radius);
        const r = bisect.right(circles, x + radius);
        let y = 0;
        for (let i = l; i < r; ++i) {
          const { x: xi, y: yi } = circles[i];
          const x2 = (xi - x) ** 2;
          const y2 = (yi - y) ** 2;
          if (radius2 > x2 + y2) {
            y = yi + Math.sqrt(radius2 - x2) + 1e-6;
            i = l - 1;
            continue;
          }
        }
        circles.splice(bisect.left(circles, x, l, r), 0, { x, y }); 
        return y;
      };
    }

    for (let i = 0; i < n; ++i) {
      if (i % 5 === 0) yield svg.node();
      const cx = x(values[i]); 
      const cy = height - margin.bottom - dodge(cx) - radius - 1;

      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", -400)
        .attr("r", radius)
        .attr("fill", "red")
        .attr("fill", "#fff") 
        .transition()
        .duration(700)
        .ease(d3.easeBounce)
        .attr("cy", cy);
    }
    
    yield svg.node();
  }

    var options = d3.select("#modal-pachinko-dist-selector")
      .selectAll("option")
      .data(Object.keys(dists))
      .enter()
      .append("option")
      .text(function(d) { return d; })
;

var selector = d3.select("#modal-pachinko-dist-selector")
  .on("change", function(d) {
    //console.log('Just changed the selector');
        $("html, body").animate({                               // if anyone's wondering what I'm doing here,
            scrollTop: $(                                       // this probably looks ESPECIALLY weird.
            'html, body').get(0).scrollHeight                   // It's a little JQuery to scroll the page
        }, 2000);                                               // to the bottom when someone uses the dropdown.
        
      var selected = d3.select(this).property("value");
      dist_selected = eval("dists.".concat(selected));
      random = dist_selected.dist_fn;
      n = dist_selected.dist_n;
      x_domain = dist_selected.dist_x_domain;

      console.log(`selected: ${selected}, AND dist_selected: ${dist_selected}`);

      d3.select("#modal-pachinko-svg")
      .selectAll("svg")
      .remove()
      ;
      
      // Run pachinko!
      const genratorAnimation = gen(); 

      let result = genratorAnimation.next();
      //genratorAnimation.next();
      let interval = setInterval(function(){
        if(!result.done) {
          genratorAnimation.next();
        }
        else {
          clearInterval(interval)
        }
      }, 50);
  })
;



