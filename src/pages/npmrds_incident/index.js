
import { AvlMap } from "modules/avl-map/src";
import config from "config.json"
import NpmrdsLayer from './components/incident_analysis_layer'
import { useFalcor } from 'modules/avl-falcor'
const MAPBOX_TOKEN = config.MAPBOX_TOKEN;

function Basic() {
  const { falcor } = useFalcor()

  return (
    <div className='w-full h-full'>
      <AvlMap
        accessToken={MAPBOX_TOKEN}
        falcor={falcor}
        mapOptions={{
          zoom: 9.5,
        center: [
          -78.70136375249648,
          42.9060269562662
          
        ],
        maplibreLogo: false,

        styles: [
              {
                name: "Satellite Streets",
                style: "mapbox://styles/am3081/cjya70364016g1cpmbetipc8u",
              },
              { name: "Dark", style: "mapbox://styles/am3081/ckm85o7hq6d8817nr0y6ute5v" },
              { name: "Light", style: "mapbox://styles/am3081/ckm86j4bw11tj18o5zf8y9pou" },
              {
                name: "Satellite",
                style: "mapbox://styles/am3081/cjya6wla3011q1ct52qjcatxg",
              },
            ]
        }}
        layers={[new NpmrdsLayer()]}
      />
    </div>
  );
}

const BasicConfig = {
  path: '/incident_map',
  name: 'Incident Map',
  mainNav: true,
  element: <Basic />
};

export default BasicConfig