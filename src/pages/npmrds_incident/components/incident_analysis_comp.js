import React from 'react'
import get from 'lodash.get'
import { useFalcor } from 'modules/avl-falcor'
import { ResponsiveLine } from '@nivo/line'

//["pm3", "measuresByTmc", tmc, year, "freeflow_tt"]

const Weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];


const TmcInfoComp = ({layer ,event_id}) => {
	const { falcor, falcorCache } = useFalcor()
	const { year, incidentTmc } = layer.state

	React.useEffect(() => {
		falcor.get(
			[
          "transcom2", "eventsbyId", event_id,
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
            "tmcs_arr"
          ]
     	],
     	["tmc", incidentTmc, "meta", year, 
	      		[
	      			"aadt", 
	      			"length", 
	      			"roadname",
	      		 	"direction",
	      		 	"tmclinear",
	      		 	"road_order",
	      		 	"county_code", 
	      		 	"firstname",
	      		 	"avg_speedlimit"
	      		]
	    ]
		).then(d => {
			const { county_code, tmclinear, direction } = get(d, ['json', "tmc", incidentTmc, "meta", year], {})
			return falcor.get(
				["tmc", "tmclinear", year,`COUNTY_${county_code}`, tmclinear, direction]
			)
		})
	},[event_id])

	const tmcMetadata = React.useMemo(() => {
		return get(falcorCache,["tmc", incidentTmc, "meta", year], {});
	}, [falcorCache,incidentTmc,year])

	const tmcLinearData = React.useMemo(() => {
		const data =  get(falcorCache,["tmc", "tmclinear", year,`COUNTY`, tmcMetadata.tmclinear, tmcMetadata.direction], {});
		console.log(data, falcorCache, 'sss')
		return data
	}, [falcorCache,incidentTmc,year,tmcMetadata])

	const event_data = React.useMemo(() => {
		return get(falcorCache,["transcom2", "eventsbyId", event_id], {})
	},[falcorCache,event_id])
	
	return( 
		<div className='border-b border-gray-200 py-4'>
			{event_id}
			<div>{incidentTmc}</div>

			<pre>
				{JSON.stringify(event_data,null ,3)}
			</pre>
		</div>
	)
}

export default TmcInfoComp