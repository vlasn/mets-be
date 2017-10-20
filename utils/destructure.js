'use strict'

module.exports = data => {
  const {matched, unmatched} = data

  if (!(unmatched.length === 0 && matched.length > 0)) return data

  data.waybills = matched.reduce((waybills, row) => {
    const VL_nr = row['Elvise VL nr']

    if (!waybills[VL_nr]) waybills[VL_nr] = {rows: [], cadastreId: row['Katastritunnus'], sum: 0.0}
    waybills[VL_nr].sum += parseFloat(row['arvestus maht'] * row['Hind'])
    waybills[VL_nr].rows = [row, ...waybills[VL_nr].rows]

    return waybills
  }, {})
  
  data.waybills.sum = Object.entries(data.waybills).reduce((sum, waybill) => sum + parseFloat(waybill[1].sum), 0.0)

  return data
}