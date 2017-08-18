'use strict'

const xlsx = require('xlsx')

module.exports = (fileLocation, fileName) => 
{
  const workbook = xlsx.readFile(fileLocation),
  sheet_name_list = workbook.SheetNames,
  data = { unmatched: [], filename: fileName }

  for(const y of sheet_name_list){
    const worksheet = workbook.Sheets[y],
    headers = {}

    for (let z in worksheet) {
      if(z[0] === '!') continue
      
        let c, r = ''; const v = worksheet[z].v
      
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