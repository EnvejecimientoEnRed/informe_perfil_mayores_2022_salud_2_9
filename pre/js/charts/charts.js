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
COLOR_ANAG_PRIM_3 = '#9E3515';
let tooltip = d3.select('#tooltip');

export function initChart(iframe) {
    ///Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_9/main/data/tasas_mortalidad_pdf.csv', function(error,data) {
        if (error) throw error;

        data.sort(function(x, y){
            return d3.ascending(+x[2001], +y[2001]);
        });

        //////VISUALIZACIÓN 
        let margin = {top: 10, right: 10, bottom: 25, left: 105},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let enfermedades = d3.map(data, function(d){return(d.Causa)}).keys().reverse();
        let tipos = ['2001', '2020'];        
        
        let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        let x = d3.scaleLinear()
            .domain([0,1500])
            .range([0,width]);

        let xAxis = function(g) {
            g.call(d3.axisBottom(x).ticks(5).tickFormat(function(d,i) { return numberWithCommas3(d); }));
            g.call(function(g) {
                g.call(function(g){
                    g.selectAll('.tick line')
                        .attr('class', function(d,i) {
                            if (d == 0) {
                                return 'line-special';
                            }
                        })
                        .attr('y1', '0')
                        .attr('y2', `-${height}`)
                });
            });
        }

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add Y axis
        let y = d3.scaleBand()
            .domain(enfermedades)
            .range([height,0])
            .padding(0.35);

        let yAxis = function(g) {
            g.call(d3.axisLeft(y));
            g.call(function(g){g.selectAll('.tick line').remove()});
            g.call(function(g){g.select('.domain').remove()});
        }
        
        svg.append("g")
            .call(yAxis);

        let ySubgroup = d3.scaleBand()
            .domain(tipos)
            .range([0, y.bandwidth()]);

        let color = d3.scaleOrdinal()
            .domain(tipos)
            .range([COLOR_PRIMARY_1, COLOR_ANAG_PRIM_3]);

        function init() {
            svg.append("g")
                .selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", function(d) { return "translate(0," + y(d.Causa) + ")"; })
                .selectAll("rect")
                .data(function(d) { return tipos.map(function(key) { return {key: key, value: d[key]}; }); })
                .enter()
                .append("rect")
                .attr('y', function(d) { console.log(d); return ySubgroup(d.key); })
                .attr('height', ySubgroup.bandwidth())
                .attr("fill", function(d) { return color(d.key); })
                .attr('x', function(d) { return x(0); })
                .attr('width', function(d) { return x(d.value) -x(0); });
        }

        //////
        ///// Resto - Chart
        //////
        init();

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
        setChartHeight(iframe);

    });    
}