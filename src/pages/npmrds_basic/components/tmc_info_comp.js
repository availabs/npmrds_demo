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


const TmcInfoComp = ({tmc,year}) => {
	const { falcor, falcorCache } = useFalcor()
	const [ show, setShow ] = React.useState('graph')
 
	const requestKey = React.useMemo(() => [
		[tmc],
	    +`${year}0101`, // start date
	    +`${year}0201`, // end date
	    0, //start epoch
	    288, // end epoch
	    Weekdays, //day filter
	    "15-minutes", // resolution 
	    /* --
	    	'5-minutes',
	    	'15-minutes',
	    	'hour',
	    	'date', 
	    	'month',
	    	'year'
	    */
	    "travel_time_all",
	    "travelTime",
	    encodeURI(JSON.stringify({})),
	    "ny"
	].join("|"), [tmc,year])

	React.useEffect(() => {
		falcor.get(
      		["tmc", tmc, "meta", year, 
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
	      	],
      		["routes", "data", [requestKey]]
    	);
	}, [tmc, year, requestKey,falcor])
	// https://graph.availabs.org/graph?paths= + urlencode(JSON.stringify(["routes", "data", [requestKey]])


	const tmcMetadata = React.useMemo(() => {
		return get(falcorCache,["tmc", tmc, "meta", year], {});
	}, [falcorCache,tmc,year])

	const tmcRouteData = React.useMemo(() => {
		return get(falcorCache,["routes", "data", requestKey, "value"], []);
	}, [falcorCache,requestKey])

	const tmcGraphData = React.useMemo(() => {
		return tmcRouteData.reduce((out,d) => {
			out.data.push({
				x: d.resolution,
				y: Math.round(tmcMetadata.length * (3600.0 / d.value) * 100 ) / 100
			})
			return out
		},{id: tmc, color: "#7dd3fc", data:[]})

	}, [tmcMetadata, tmcRouteData,tmc])

	return( 
		<div className='border-b border-gray-200 py-4'>
			<div>
				<span className='p-2 font-thin text-lg'>{tmcMetadata.roadname} {tmcMetadata.direction}  </span>
				<span className='text-sm '>{tmc} </span>
				<select 
					className='bg-gray-50 py-2 px-4 border border-gray-200 focus:outline-none'
					value={show} 
					onChange={e => setShow(e.target.value)}
				>
					<option value={'graph'}>Graph</option>
					<option value={'data'}>Data</option>
				</select>
			</div>
			{show === 'graph' ? 
				<div className='h-[250px]'>

					<div>Annual Average Weekday Speed (5 Minute epochs)</div>
					<ResponsiveLine
				        data={[tmcGraphData]}
				        colors={d => d.color}
				        margin={{ top: 10, right: 10, bottom: 50, left: 30 }}
						yScale={{
				            type: 'linear',
				            min: 'auto',
				            max: 'auto',
				            reverse: false
				        }}
				        xScale={{
				        	type: 'linear'
				        }}
				        enablePoints={false}
				        axisBottom={{
				            orient: 'bottom',
				            tickSize: 5,
				            tickPadding: 5,
				            tickRotation: 0,
				            legend: 'epochs',
				            legendOffset: 36,
				            legendPosition: 'middle'
				        }}
				    />
				</div> : (
					<div>
						<div> metadata</div>
						<pre className='bg-gray-100 p-1'>
							{JSON.stringify(tmcMetadata,null,3)}
						</pre>
						<div> avg daily speed (5 minute) </div>
						<pre className='bg-gray-100 p-1'>
							{JSON.stringify(tmcRouteData,null,3)}
						</pre>
					</div>
				)
			}
		</div>
	)
}

export default TmcInfoComp