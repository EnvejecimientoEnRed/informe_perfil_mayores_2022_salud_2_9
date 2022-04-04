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

        console.log(data);

        let tipoCausa = 'I. Infecciosas*';


        function init(tipoCausa) {

        }

        function updateChart(tipoCausa) {

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