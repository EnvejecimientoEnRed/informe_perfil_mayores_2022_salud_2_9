//Desarrollo de las visualizaciones
import * as d3 from 'd3';
//import { numberWithCommas2 } from './helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

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
                tipoY = 300;
            } else {
                tipoY = 1600;
            }
            updateAxis(tipoY);
        });

        //////VISUALIZACIÓN
        let margin = {top: 10, right: 10, bottom: 20, left: 45},
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

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, 1600])
            .range([ height, 0 ]);

        svg.append("g")
            .attr('class','yaxis')
            .call(d3.axisLeft(y).ticks(5));

        function init(tipoCausa) {
            svg.selectAll(".line")
                .data(sumstat)
                .enter()
                .append("path")
                .attr('class', 'lines')
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
                .attr("d", function(d){
                    return d3.line()
                        .x(function(d) { return x(d.Periodo) + x.bandwidth() / 2; })
                        .y(function(d) { return y(+d.Valor); })
                        (d.values)
                });
        }

        function updateChart(tipoCausa) {
            svg.selectAll(".lines")
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
                .attr("d", function(d){
                    return d3.line()
                        .x(function(d) { return x(d.Periodo) + x.bandwidth() / 2; })
                        .y(function(d) { return y(+d.Valor); })
                        (d.values)
                });
        }

        function updateAxis(ejeY) {
            y.domain([0,ejeY])
            svg.select(".yaxis")
                .transition()
                .duration(1500)
                .call(d3.axisLeft(y));

            updateChart(tipoCausa);
        }

        function animateChart() {

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
        setCustomCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('comparativa_mortalidad_65');
            setChartCustomCanvasImage('comparativa_mortalidad_65');
        });

        //Altura del frame
        setChartHeight(iframe);

    });    
}