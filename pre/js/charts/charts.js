//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C',
COLOR_GREY_1 = '#D6D6D6';
let tooltip = d3.select('#tooltip');

export function initChart(iframe) {
    ///Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_9/main/data/tasas_mortalidad_causa_2001_2020_v2.csv', function(error,data) {
        if (error) throw error;

        //////SELECTOR
        let tipoCausa = 'I. Infecciosas*';
        document.getElementById('enfermedad_cronica').addEventListener('change', function(e) {
            tipoCausa = e.target.value;
            updateChart(tipoCausa);
        });

        let tipoY = 1600;
        document.getElementById('change_yaxis').addEventListener('click', function(e) {
            if (tipoY == 1600) {
                tipoY = 250;

                //Modificamos el texto del botón
                e.target.textContent = 'Eje Y en tasa 1.600';
            } else {
                tipoY = 1600;

                //Modificamos el texto del botón
                e.target.textContent = 'Eje Y en tasa 250';
            }

            //Cambiamos eje
            updateAxis(tipoY);
        });

        //////VISUALIZACIÓN
        let paths; 
        let margin = {top: 10, right: 10, bottom: 25, left: 45},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let sumstat = d3.nest()
            .key(function(d) { return d.Causa;})
            .entries(data);

        let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        let x = d3.scaleBand()
            .domain(d3.map(data, function(d) { return d.Periodo; }).keys())
            .range([ 0, width ]);

        let xAxis = function(g) {
            g.call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ if(i == 0 || i == 4 || i == 9 || i == 14 || i == 19){ return d; } })));
            g.call(function(g){g.selectAll('.tick line').remove()});
            g.call(function(g){g.select('.domain').remove()});
        }

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, 1600])
            .range([ height, 0 ]);

        let yAxis = function(svg) {
            svg.call(d3.axisLeft(y).ticks(5).tickFormat(function(d,i) { return numberWithCommas3(d); }));
            svg.call(function(g) {
                g.call(function(g){
                    g.selectAll('.tick line')
                        .attr('class', function(d,i) {
                            if (d == 0) {
                                return 'line-special';
                            }
                        })
                        .attr('x1', '0%')
                        .attr('x2', `${width}`)
                });
            });
        }

        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        function init(tipoCausa) {
            //Líneas
            svg.selectAll(".line")
                .data(sumstat)
                .enter()
                .append("path")
                .attr('class', 'rect')
                .attr("fill", "none")
                .attr("stroke", function(d){ 
                    if(d.key == tipoCausa) {
                        return COLOR_PRIMARY_1;
                    } else {
                        return COLOR_GREY_1;
                    }
                 })
                .attr("opacity", function(d) {
                    if(d.key == tipoCausa) {
                        return '1';
                    } else {
                        return '0.5';
                    }
                })
                .attr("stroke-width", function(d) {
                    if(d.key == tipoCausa) {
                        return '3';
                    } else {
                        return '2';
                    }
                })
                .attr("d", function(d){
                    return d3.line()
                        .x(function(d) { return x(d.Periodo) + x.bandwidth() / 2; })
                        .y(function(d) { return y(+d.Valor); })
                        (d.values)
                });

            //Líneas para animación
            paths = svg.selectAll('.rect');
    
            paths.attr("stroke-dasharray", 1000 + " " + 1000)
                .attr("stroke-dashoffset", 1000)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(2000);

            //Círculos para tooltip
            svg.selectAll('circles')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', function(d) {
                    return 'circle ' + d.Periodo;
                })
                .attr('cx', function(d) {
                    return x(d.Periodo) + x.bandwidth() / 2;
                })
                .attr('cy', function(d) {
                    return y(+d.Valor);
                })
                .attr('r', 3)
                .attr('stroke', 'none')
                .attr('fill', 'transparent')
                .on('mouseover', function(d,i,e) {
                    //Opacidad en círculos
                    let css = e[i].getAttribute('class').split(' ')[1];
                    let circles = svg.selectAll('.circle');                    
            
                    circles.each(function() {
                        //this.style.stroke = '0.4';
                        let split = this.getAttribute('class').split(" ")[1];
                        if(split == `${css}`) {
                            this.style.stroke = 'black';
                            this.style.strokeWidth = '1';
                        }
                    });

                    //Texto
                    let html = '<p class="chart__tooltip--title">' + d.Causa + '</p>' + 
                        '<p class="chart__tooltip--text">En <b>' + d.Periodo + '</b>, la tasa de mortalidad para este tipo de causa se sitúa en <b>' + numberWithCommas3(parseFloat(d.Valor).toFixed(1)) + '</b> por cada 100.000 habitantes</p>';
                
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let circles = svg.selectAll('.circle');
                    circles.each(function() {
                        this.style.stroke = 'none';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                });
        }

        function updateChart(tipoCausa) {
            //Líneas
            svg.selectAll(".rect")
                .attr("fill", "none")
                .attr("stroke", function(d){ 
                    if(d.key == tipoCausa) {
                        return COLOR_PRIMARY_1;
                    } else {
                        return COLOR_GREY_1;
                    }
                 })
                .attr("opacity", function(d) {
                    if(d.key == tipoCausa) {
                        return '1';
                    } else {
                        return '0.5';
                    }
                })
                .attr("stroke-width", function(d) {
                    if(d.key == tipoCausa) {
                        return '2';
                    } else {
                        return '1.5';
                    }
                })
                .transition()
                .duration(2000)
                .attr("d", function(d){
                    return d3.line()
                        .x(function(d) { return x(d.Periodo) + x.bandwidth() / 2; })
                        .y(function(d) { return y(+d.Valor); })
                        (d.values)
                });

            //Círculos
            svg.selectAll('.circle')
                .attr('cx', function(d) {
                    return x(d.Periodo) + x.bandwidth() / 2;
                })
                .attr('cy', function(d) {
                    return y(+d.Valor);
                })
                .attr('r', 3)
                .attr('stroke', 'none')
                .attr('fill', 'transparent');
        }

        function updateAxis(ejeY) {
            //Modificamos el eje Y de la visualización
            y.domain([0,ejeY]);

            svg.select(".yaxis")
                .transition()
                .duration(2000)
                .call(yAxis);

            updateChart(tipoCausa);
        }

        function animateChart() {
            paths.attr("stroke-dasharray", 1000 + " " + 1000)
                .attr("stroke-dashoffset", 1000)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(2000);
        }

        //////
        ///// Resto - Chart
        //////
        init(tipoCausa);

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();
        });

        //////
        ///// Resto
        //////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_salud_2_9', 'comparativa_mortalidad_65');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('comparativa_mortalidad_65');

        //Captura de pantalla de la visualización
        setChartCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('comparativa_mortalidad_65');
        });

        //Altura del frame
        setChartHeight();
    });    
}