// args <https://github.com/msikma/args>
// © MIT license

function tabulateUsage(usageData, argColumns) {
  const { colUsage, colFullWidth } = argColumns
  const rows = []
  if (usageData.title) {
    rows.push([[colFullWidth, usageData.title]])
  }
  const cols = []
  cols.push([colUsage[0], usageData.usageProg])
  cols.push([colUsage[1], ''])
  cols.push([colUsage[2], usageData.usageArgs])
  rows.push(cols)
  return {
    rows: [rows]
  }
}

module.exports = {
  tabulateUsage
}
