const timestamps = [];
const asteriskValues = [];
const callMasterValues = [];
const mariaDBValues = [];

// Funcție pentru a filtra datele la fiecare 5 minute
function filterData(data) {
    return data.filter((_, index) => index % 5 === 0);
}

// Funcție pentru a formata data și ora
function formatDateTime(date) {
    const daysOfWeek = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sam"];
    const day = daysOfWeek[date.getDay()];
    const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const hours = date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return `${day}, ${dateString} ${hours}:${minutes}`;
}

async function getChartData() {
    const response = await fetch('/api/core/stats');  
    const data = await response.json();

    const filteredData = filterData(data);

    filteredData.forEach(stat => {
        const date = new Date(stat.timestamp);
        timestamps.push(formatDateTime(date));
        asteriskValues.push(stat.asterisk_memory);
        callMasterValues.push(stat.callmaster_memory);
        mariaDBValues.push(stat.mariadb_memory);
    });
}

async function drawChart() {
    const ctx = document.getElementById('big-line-chart').getContext('2d');
    const chartColors = {
        asterisk: '#00D1B2',
        callMaster: '#209CEE',
        mariaDB: '#FF3860'
    };

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Utilizare Memorie Asterisk',
                backgroundColor: chartColors.asterisk,
                borderColor: chartColors.asterisk,
                data: asteriskValues,
                fill: false,
            }, {
                label: 'Utilizare Memorie CallMaster',
                backgroundColor: chartColors.callMaster,
                borderColor: chartColors.callMaster,
                data: callMasterValues,
                fill: false,
            }, {
                label: 'Utilizare Memorie MariaDB',
                backgroundColor: chartColors.mariaDB,
                borderColor: chartColors.mariaDB,
                data: mariaDBValues,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Utilizarea Memoriei pe Servere'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Data și Ora'
                    },
                    ticks: {
                        maxTicksLimit: 10 // Reduce aglomerarea pe axa x
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Utilizare Memorie (KB)'
                    }
                }]
            }
        }
    });
}

// Funcție pentru a reîmprospăta datele și graficul
async function refreshChart() {
    timestamps.length = 0;
    asteriskValues.length = 0;
    callMasterValues.length = 0;
    mariaDBValues.length = 0;
    await getChartData();
    drawChart();
}

// Adăugarea unui eveniment de click pentru butonul de refresh
document.querySelector('.mdi-reload').addEventListener('click', refreshChart);

async function main() {
    await getChartData();
    await drawChart();
}

main();
