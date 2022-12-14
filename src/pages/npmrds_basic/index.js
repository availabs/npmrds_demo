
import { AvlMap } from "modules/avl-map/src";
import config from "config.json"
import NpmrdsLayer from './components/npmrds_layer'
const MAPBOX_TOKEN = config.MAPBOX_TOKEN;

function Basic() {

  return (
    <div className='w-full h-full'>
      <AvlMap
        accessToken={MAPBOX_TOKEN}
        mapOptions={{
          zoom: 6.5,
          center: [
            -75.750732421875,
           42.89206418807337
        ],
        styles: [
              {
                name: "Satellite Streets",
                style: "mapbox://styles/am3081/cjya70364016g1cpmbetipc8u",
              },
              { name: "Light", style: "mapbox://styles/am3081/ckm86j4bw11tj18o5zf8y9pou" },
              
              { name: "Dark", style: "mapbox://styles/am3081/ckm85o7hq6d8817nr0y6ute5v" },
              
              
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
  path: '/',
  name: 'Basic Map',
  mainNav: true,
  element: <Basic />
};

export default BasicConfig