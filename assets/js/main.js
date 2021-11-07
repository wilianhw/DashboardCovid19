(() => {
    document.getElementById("combo").addEventListener("change", handlerChange);
    document.getElementById("today").addEventListener("change", handlerChange);
    
    (async () => {
        let response = await Promise.allSettled([
            fetch('https://api.covid19api.com/countries'),
            fetch('https://api.covid19api.com/summary')
        ]);
    
        if(response[0].status == "fulfilled") {
            loadCountries(await response[0].value.json());
        }
    
        if(response[1].status == "fulfilled") {
            loadSummary(await response[1].value.json());
        }
    })();
})();


function loadCountries(data) {
    let combo = document.getElementById('combo');
    
    data.sort((a,b) => { 
        let x = a.Country.toUpperCase();
        let y = b.Country.toUpperCase();

        return x === y ? 0 : x > y ? 1 : -1;
    });

    for (index in data) {
        combo.options[combo.options.length] = new Option(
            data[index].Country,
            data[index].Slug
        );
    }
}

function loadSummary(data) {
    let confirmed = document.getElementById("confirmed");
    let death = document.getElementById("death");
    let recovered = document.getElementById("recovered");
    let active = document.getElementById("active");

    confirmed.innerText = data.Global.TotalConfirmed.toLocaleString("PT");
    death.innerText = data.Global.TotalDeaths.toLocaleString("PT");
    recovered.innerText = data.Global.TotalRecovered.toLocaleString("PT");
    active.innerText = data.Global.Date;

    document.getElementById('actives').innerText = "Atualização"
}

function loadData(data) {
    console.log(data)
    let yConfirmedDelta = data[1].Confirmed - data[2].Confirmed;
    let yDeathsDelta = data[1].Deaths - data[2].Deaths;
    let yRecoveredDelta = data[1].Recovered - data[2].Recovered;
    let yActiveDelta = data[1].Active - data[2].Active;

    let tConfirmedDelta = data[2].Confirmed - data[1].Confirmed;
    let tDeathsDelta = data[2].Deaths - data[1].Deaths;
    let tRecoveredDelta = data[2].Recovered - data[1].Recovered;
    let tActiveDelta = data[2].Active - data[1].Active;

    document.getElementById('confirmed').innerText = data[2].Confirmed.toLocaleString("PT");
    document.getElementById('death').innerText = data[2].Deaths.toLocaleString("PT");
    document.getElementById('recovered').innerText = data[2].Recovered.toLocaleString("PT");
    document.getElementById('active').innerText = data[2].Active.toLocaleString("PT");

    document.getElementById('actives').innerText = "Total Ativos"

    insertDailyData("tconfirmed", tConfirmedDelta, tConfirmedDelta < yConfirmedDelta);
    insertDailyData("tdeath", tDeathsDelta, tDeathsDelta < yDeathsDelta);
    insertDailyData("trecovered", tRecoveredDelta, tRecoveredDelta < yRecoveredDelta);
    insertDailyData("tactive", tActiveDelta, tActiveDelta < yActiveDelta);
}

function insertDailyData(element, value, increase) {
    console.log(element)
    if(increase) {
        document.getElementById(element).innerHTML = `
            <img src='/assets/img/up.png'> Diário ${value.toLocaleString("PT")}
        `
    } else {
        document.getElementById(element).innerHTML = `
            <img src='/assets/img/down.png'> Diário ${value.toLocaleString("PT")}
        `
    }
}

function handlerChange() {
    let country = document.getElementById("combo");

    if(country.value !== "Global") {

        let startDate = new Date(document.getElementById("today").value);

        const endDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + 1,
            -3,
            0,
            1,
            0
        );

        startDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() - 1,
            -3,
            0,
            0,
            0
        )

        fetch(`https://api.covid19api.com/country/${country.value}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`)
            .then(res => res.json())
            .then(json => loadData(json));
        
    } 
}
