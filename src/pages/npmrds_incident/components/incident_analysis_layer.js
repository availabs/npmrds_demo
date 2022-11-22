// import mapboxgl from "maplibre-gl";
import get from "lodash.get";

import { LayerContainer } from "modules/avl-map/src";
import HoverComp from './hover_comp'

import {
  ConflationSources,
  ConflationLayers,
  ConflationCaseLayers,
} from "components/map_data/conflation_sources";

import IncidentAnalysis from './incident_analysis_comp'


const colorsForTypes = {
  "Crash":"#fde72f",
  "Emergency Operations":"#95d840",
  "Road Hazard": "#55a488",
  "Special Event": "#2f708e"
}



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
    year: 2022,
    incident_date: '2022-09-22',
    incident_geom: 'REGION-5',
    activeIncident: null,
    incidentTmc: null
  }
  sources = [
    ...ConflationSources,
    {
      id: "events-source",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      },
    }
  ];
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
    /*...ConflationCaseLayers.map((layer) => ({
      ...layer,
      paint: {
        ...layer.paint,
        "line-color": "#facc15",
      },
      filter: ["all",
            CaseLayerFilters[layer.id],
            ["has", "tmc"]
          ]
    })),*/
    {
      id: "events-points",
      type: "circle",
      source: "events-source",
      paint: {
        "circle-radius": 6,
        "circle-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#d92",
          ["get", "color"]
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#333"
      },
    },
  ];

  infoBoxes = [
    {
      Component: ({layer}) => {
        return  (
            <div className='overflow-y-auto w-[400px] absolute right-2 top-2 bottom-32 overflow-y-auto overflow-x-hidden'>
              <div className='bg-white p-2 w-full'>
                { layer.state.activeIncident ? 
                  <IncidentAnalysis 
                    event_id={layer.state.activeIncident}
                    layer={layer}
                  /> :
                  "Click Incident to get Info"
                }
              </div>
            </div>
        )
      },
      show: true
    },
    {
      Component: ({layer}) => {
        return  (
            <div className='overflow-y-auto w-[400px] absolute left-2 top-2 bottom-2 overflow-y-auto overflow-x-hidden'>
              <div className='bg-white p-2 w-full pointer-events-auto'>
               
                "Incident List"
              
              </div>
            </div>
        )
      },
      show: true
    }
  ]

  onClick = {
    layers: ['events-points'],
    callback: function(layerId, features, lngLat, point) {
      const eventId = get(features,'[0].properties.id',null)
      console.log('onclick', features, eventId,)
      if(eventId){
        const bbox = [
        [point.x - 1, point.y - 1],
        [point.x + 1, point.y + 1]
        ];
        // Find features intersecting the bounding box.
        const selectedFeatures = this.mapboxMap.queryRenderedFeatures(bbox, {
          layers: ConflationLayers.map((l) => l.id)
        });
        console.log('selectedFeatures', selectedFeatures)

        this.updateState({...this.state, activeIncident: eventId, incidentTmc: get(selectedFeatures, '[0].properties.tmc', null)})
      }
    }
  }

  onHover = {
    layers: ["events-points"],// , ...ConflationLayers.map((l) => l.id)],
    pinnable: false,
    callback: function(layerId, features) {
      return [features[0].properties];
    },
    HoverComp
  };

  getIncidentRequest() {
    return JSON.stringify([
        this.state.incident_date, //startDate
        this.state.incident_date, //end date -- when they are the same we get one day of data
        this.state.incident_geom,
        ['incident'], //eCategory.startsWith("All") ? null : eCategory,
        null //eType.startsWith("All") ? null : eType
      ])
    // ----
    // formula to get data from js Date object
    // new Date(y, m-1, 1).toISOString().substring(0, 10), //start date
    // --
  }

  fetchData(falcor) {
    //console.log(falcor)
    return falcor.get(["transcom2", "eventsbyGeom", this.getIncidentRequest()])
      .then(d => {
        const eventIds = get(d, ['json',"transcom2", "eventsbyGeom", this.getIncidentRequest()], [])
        console.log('hello', d, eventIds)
        return eventIds.length > 0 ?
         falcor.get([
          "transcom2", "eventsbyId", eventIds,
          [
            "event_id",
            "facility",
            "description",
            "start_date_time",
            "event_duration",
            "event_type",
            "event_category",
            "nysdot_general_category",
            "nysdot_sub_category",
            "start_date_time",
            "geom"
          ]
        ]) : {}
      })
  }

  render(mapboxMap, falcor) {
    const incidentsData = falcor.getCache()
    const events = Object.values(get(incidentsData, ['transcom2', 'eventsbyId'], {}))
    
    // -- 
    // create geojson object with events as features
    // and update the source
    // ---
    const eventsCollection = {
      type: "FeatureCollection",
      features: events
        //.sort((a, b) => a.event_id.localeCompare(b.event_id))
        .map((event, i) => {
          return {
            type: "Feature",
            id: i,
            properties: {
              id: event.event_id,
              facility: event.facility,
              type: event.event_type,
              start: event.start_date_time,
              //delay: +get(event, 'congestion_data.value.vehicleDelay', 0),
              duration: event.event_duration,
              description: event.description,
              color: get(colorsForTypes, [event.nysdot_sub_category], "#009")
            },
            geometry: event.geom.value
          }
        })
    }
    this.mapboxMap.getSource("events-source").setData(eventsCollection);
    // ---

    // ---
    // TMC geometries are refreshed every year 
    // so we need the ability to switch the network between years
    // this code filters the available layers to the current year
    //
    const id2Caseid = (a) => [a.slice(0, 3), 'case', a.slice(3)].join('');
    const string = `^con-${this.state.year}(?:-\\w+)+?`
    const regex = new RegExp(string);
    
    ConflationLayers.forEach(({ id }) => {    
      if (regex.test(id)) {
        mapboxMap.setLayoutProperty(id, "visibility", "visible");  
        //mapboxMap.setLayoutProperty(id2Caseid(id), "visibility", "visible");
      }
      else {
        mapboxMap.setLayoutProperty(id, "visibility", "none");
        //mapboxMap.setLayoutProperty(id2Caseid(id), "visibility", "none");
      }
    })
    // ---------

   
  }
}

export default NpmrdsLayer