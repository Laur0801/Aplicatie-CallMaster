/* global $ Chart */

const timestamps = []
const asteriskValues = []
const zyvoValues = []

async function getChartData () {
  const response = await fetch('/stats')
  const data = await response.json()

  if (data.length < 9) {
    $('#chartSec').hide()
  }

  for (let i = 0; i < data.length; i++) {
    const timestamp = data[i].created_at
    const asteriskStats = JSON.parse(data[i].asterisk_stats)
    const zyvoStats = JSON.parse(data[i].zyvo_stats)

    timestamps.push((new Date(timestamp)).getHours() + ':' + (new Date(timestamp)).getMinutes())
    asteriskValues.push(((parseInt(asteriskStats.memory)) / 1000000).toFixed(2))
    zyvoValues.push(((parseInt(zyvoStats.memory)) / 1000000).toFixed(2))
  }
}

async function drawChart () {
  const chartColors = {
    default: {
      primary: '#00D1B2',
      info: '#209CEE',
      danger: '#FF3860'
    }
  }

  const ctx = document.getElementById('big-line-chart').getContext('2d')

  /* eslint-disable no-new */
  new Chart(ctx, {
    type: 'line',
    display: true,
    data: {
      datasets: [{
        label: 'Asterisk Memory Usage',
        fill: true,
        borderColor: chartColors.default.primary,
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        pointBackgroundColor: chartColors.default.primary,
        pointBorderColor: 'rgba(255,255,255,0)',
        pointHoverBackgroundColor: chartColors.default.primary,
        pointBorderWidth: 20,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: asteriskValues
      }, {
        label: 'Zyvo Memory Usage',
        fill: true,
        borderColor: chartColors.default.info,
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        pointBackgroundColor: chartColors.default.info,
        pointBorderColor: 'rgba(255,255,255,0)',
        pointHoverBackgroundColor: chartColors.default.info,
        pointBorderWidth: 20,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: zyvoValues
      }],
      labels: timestamps
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      responsive: true,
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: 'nearest',
        intersect: 0,
        position: 'nearest'
      },
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: 'transparent'
          },
          ticks: {
            padding: 20,
            fontColor: '#9a9a9a'
          }
        }],
        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(225,78,202,0.1)',
            zeroLineColor: 'transparent'
          },
          ticks: {
            padding: 20,
            fontColor: '#9a9a9a'
          }
        }]
      }
    }
  })
}

async function main () {
  await getChartData()
  await drawChart()
}

main()
