// import mapboxgl from "maplibre-gl";
import get from "lodash.get";

import { LayerContainer } from "modules/avl-map/src";

import {
  ConflationSources,
  ConflationLayers,
  ConflationCaseLayers,
} from "components/map_data/conflation_sources";

import TmcInfoComp from './components/tmc_info_comp'




const BaseLayerFilters = ConflationLayers.reduce((a, { id, filter }) => {
  a[id] = filter;
  return a;
}, {});

const CaseLayerFilters = ConflationCaseLayers.reduce((a, { id, filter }) => {
  a[id] = filter;
  return a;
}, {});

class NpmrdsLayer extends LayerContainer {
  name = "NPMRDS Layer";
  
  // fetchData(falcor) {
  //   const { year, tmcs = [] } = this.props;
  //   if (!(year && tmcs.length)) {
  //     console.log('map no fetch')
  //     return Promise.resolve();
  //   }
  //   console.log('map fetching')
  //   return falcor.get([
  //     "tmc", tmcs, "meta", year, ["aadt", "bounding_box", "length", "roadname", "direction","tmclinear","road_order","county_code", "firstname"]
  //   ]);

  // }
  
  state ={
    tmcs: [],
    year: 2022
  }
  sources = ConflationSources;
  layers = [
    ...ConflationLayers.map((layer) => ({
      ...layer,
      paint: {
        ...layer.paint,
        "line-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#fef08a",
          "#fefce8"//"rgba(240,240,240,0.1)",
        ],
      },
      filter: ["all",
            BaseLayerFilters[layer.id],
            ["has", "tmc"]
          ]
    })),
    ...ConflationCaseLayers.map((layer) => ({
      ...layer,
      paint: {
        ...layer.paint,
        "line-color": "#facc15",
      },
      filter: ["all",
            CaseLayerFilters[layer.id],
            ["has", "tmc"]
          ]
    })),
    
  ];

  infoBoxes = [
    {
      Component: ({layer}) => {
        return  (
            <div className='overflow-y-auto w-[400px]  absolute right-2 top-2 bottom-32 overflow-y-auto overflow-x-hidden'>
              <div className='bg-white p-2 w-full'>
              {layer.state.tmcs.length > 0 ? 
                layer.state.tmcs.map(tmc => 
                  <TmcInfoComp key={tmc} tmc={tmc} year={layer.state.year}/>
                ) : 
                "Click TMC on Map to get Info"
              }
              </div>
            </div>
        )
      },
      show: true

    }
  ]

  onClick = {
    layers: ConflationLayers.map((l) => l.id),
    callback: function(layerId, features) {
      const tmc = get(features,'[0].properties.tmc',null)
      if(tmc){
        if(!this.state.tmcs.includes(tmc)){
          this.updateState({...this.state, tmcs: [...this.state.tmcs, tmc]})
        } else {
          this.updateState({...this.state, tmcs: this.state.tmcs.filter(t => t !== tmc)})
        }
      }
    }
  }

  onHover = {
    layers: ConflationLayers.map((l) => l.id),
    pinnable: false,
    callback: function(layerId, features) {
      const tmcs = new Set();
      return features.reduce((a, { properties }) => {
        const { tmc } = properties;
        if (tmc && !tmcs.has(tmc)) {
          tmcs.add(tmc);
          a.push(
            [tmc],
            ['layer',layerId]
          );
        }
        return a;
      }, []);
    },
    property: "tmc",
  };

  render(mapboxMap, falcor) {
    const id2Caseid = (a) => [a.slice(0, 3), 'case', a.slice(3)].join('');
    
    const string = `^con-${this.state.year}(?:-\\w+)+?`
    const regex = new RegExp(string);
    
    // ---
    // TMC geometries are refreshed every year 
    // so we need the ability to switch the network between years
    // this code filters the available layers to the current year
    //
    ConflationLayers.forEach(({ id }) => {
        
      if (regex.test(id)) {
        mapboxMap.setLayoutProperty(id, "visibility", "visible");  
        mapboxMap.setLayoutProperty(id2Caseid(id), "visibility", "visible");
        // ---
        // filter the case layer to highlight selection
        // 
        mapboxMap.setFilter(id2Caseid(id),
          ["all",
            BaseLayerFilters[id],
            ["any",
              ["in", ["get", "tmc"], ["literal", this.state.tmcs]]/*,
              ["in", ["get", "id"], ["literal", ways]]*/
            ]
          ]
        );
        
      }
      else {
        mapboxMap.setLayoutProperty(id, "visibility", "none");
        mapboxMap.setLayoutProperty(id2Caseid(id), "visibility", "none");
      }
    })
   
  }
}

export default NpmrdsLayer