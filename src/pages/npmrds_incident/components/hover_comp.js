import React from 'react'
import get from 'lodash.get'

const HoverComp = ({ data, layer }) => {
  return (
    <div className='bg-white p-4 max-w-xs grid grid-cols-1 gap-1'>

      { data
          .filter((d,i) => d.id != get(data, `[${i+1}].id`, false))
          .map(d =>
            <div key={ d.id }>
              <div className='font-bold border-b border-gray-100 '>
                {d.facility}: {d.type} <i className="fa fa-arrow-up-right-from-square"/>
              </div>
              <div>
               <span className="font-semibold">id</span> { d.id }
              </div>
              <div>
                <span className="font-semibold">Open Time:</span> { d.start }
              </div>

              <div className='flex'>
                <div className='flex-1 '>
                  <span className="font-semibold">Duration</span>{d.duration} min
                </div>
              </div>
              <div className="whitespace-pre-wrap">
                { d.description }
              </div>
            </div>
          )
      }
    </div>
  )
}

export default HoverComp