'use strict'

module.exports = d => {
  let p = new Promise((resolve,reject) => {
    if (d.unmatched.length === 0 && d.matched.length > 0) {
      for (let row of d.matched) {
        if (d.matched.indexOf(row) === 0) {
          d.veoselehed[0] = {
            VL_nr: row['Elvise VL nr'],
            cadastre: row['Katastritunnus'],
            rows: [],
            sum: (parseFloat(row['arvestus maht']) * parseFloat(row['Hind']))
          }
          d.veoselehed[0].rows.push(row)
        } else if (d.matched.indexOf(row) > 0) {
          let len = d.veoselehed.length

          for (let el of d.veoselehed) {
            if (row['Elvise VL nr'] === el.VL_nr) {
              el.sum = parseFloat(el.sum) + (parseFloat(row['arvestus maht']) *
              parseFloat(row['arvestus maht']))
              el.rows.push(row)
              break
            } else if (row['Elvise VL nr'] !== el.VL_nr){
              d.veoselehed[len] = {
                VL_nr: row['Elvise VL nr'],
                cadastre: row['Katastritunnus'],
                rows: [],
                sum: (parseFloat(row['arvestus maht']) * parseFloat(row['Hind']))
              }
              d.veoselehed[len].rows.push(row)
              break
            }
          }
        }
      }
      resolve(d)
    }
  })

  return p
  .then(d => {
    let sum = 0
    for (let v of d.veoselehed) sum += v.sum
    console.log('does report sum match cargos sum:', d.testSum === sum)
    return d
  })
}