'use strict'

const xlsx = require('xlsx'),
path = require('path')

module.exports = location => 
{
  const workbook = xlsx.readFile(location),
  sheet_name_list = workbook.SheetNames,
  name = path.basename(location),
  data = { unmatched: [], filename: name }

  for(let y of sheet_name_list){
    let worksheet = workbook.Sheets[y],
    headers = {}
    for (let z in worksheet) {
      if(z[0] === '!') continue
        let c, r = '', v = worksheet[z].v
      
      for (const s of z) isNaN(s) ? c+=s : r+=s*1
      if (r == 1) {
        headers[c] = v
        continue
      }

      if (!data.unmatched[r]) data.unmatched[r] = {}
      data.unmatched[r][headers[c]] = v
    }

    data.unmatched.shift()
    data.unmatched.shift()
  }
  return data
}