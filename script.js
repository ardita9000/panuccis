
    currentView = 'reservation_view'
    currentTab = 'mainData'
    document.getElementById(`${currentTab}_step`).classList.add('active');

    var config;
    config_json = fetch('/config.json');
    config_json.then((response) => {
    response.json().then(json => {
        config = json;
        config.couchdb.auth_header = btoa(`${config.couchdb.login}:${config.couchdb.password}`);
    });
});

    function nextTab(theNextTab) {
    document.getElementById(currentTab).style.display = 'none';
    document.getElementById(`${currentTab}_step`).classList.remove('active');
    if(theNextTab==='table') {
    db_get_reservations("panucci", document.getElementById('start').value, cross_reserved_tables)
}
    currentTab = theNextTab;

    document.getElementById(theNextTab).style.display = 'block';
    document.getElementById(`${theNextTab}_step`).classList.add('active');
}


    function viewChange() {
    if (currentView == 'reservation_view') {
    document.getElementById('reservation_view').style.display = 'none';
    document.getElementById('worker_view').style.display = 'flex';
    document.getElementById("viewButton").innerHTML = 'Reservieren';
    currentView = 'worker_view';
} else {
    document.getElementById('reservation_view').style.display = 'flex';
    document.getElementById('worker_view').style.display = 'none';
    document.getElementById("viewButton").innerHTML = 'Mitarbeiter-Login';
    currentView = 'reservation_view';
    workerLogout();
}
}

    function workerLogin() {
    document.getElementById('workerLogin').style.display = 'none';
    document.getElementById('workerOverview').style.display = 'inline';
    document.getElementById('logoutButton').style.display = 'block'
}

    function workerLogout() {
    document.getElementById('workerLogin').style.display = 'inline';
    document.getElementById('workerOverview').style.display = 'none';
    document.getElementById("username").value = '';
    document.getElementById("password").value = '';
}

    function workerNextDate() {
    document.getElementById('workerPrevButton').disabled = false;
    document.getElementById('workerNextButton').disabled = true;
    document.getElementById('workerDate').innerHTML = '19.01.22'
    document.getElementById('second').style.display = "table";
    document.getElementById('first').style.display = 'none';
}

    function workerPrevDate() {
    document.getElementById('workerPrevButton').disabled = true;
    document.getElementById('workerNextButton').disabled = false;
    document.getElementById('workerDate').innerHTML = '18.01.22 (heute)'
    document.getElementById('first').style.display = "table";
    document.getElementById('second').style.display = 'none';
}

    function updateNav(){
    guests = document.getElementById('guests').value;
    date = document.getElementById('start').value;
    time = document.getElementById('time').value;
    document.getElementById('description').innerText = guests + ' Personen, ' + date + ', ' + time + 'Uhr';
    document.getElementById(`${currentTab}_step`).classList.add('finished');

    if(currentTab == 'table') {
    let tables = document.querySelectorAll('.table');
    let tables_selected = false;
    tables.forEach((event) => {
    if(event.style['background-color'] == 'green'){
    tables_selected = true;
}
})
    if(tables_selected){
    document.getElementById('table_description').innerText = 'Lieblingstisch ausgewählt'
}
}

    if(currentTab == 'dish') {
    selects = document.querySelectorAll('#dish > select');
    if(Array.from(selects).some((event) => event.value != '')){
    document.getElementById('dish_description').innerText = 'Lieblingsspeisen gewählt'
}
}
}

    function selectedTable(){

    let tables = document.querySelectorAll('.table');
    let green_tables = Array.from(tables).filter((table) => table.style['background-color'] == 'green');

    guests = Math.ceil(document.getElementById('guests').value/2);

    if(green_tables.length >= guests){
    if(event.target.style['background-color'] == 'green'){
    event.target.style['background-color'] = '#deb887';
    return;
}
    alert("Sie haben für die gewählte Personenanzahl ausreichend Tische ausgewählt");
    return;
}

    if(event.target.style['background-color'] == 'green'){
    event.target.style['background-color'] = '#deb887';
}
    else {
    event.target.style['background-color'] = 'green';
}
}

    function selectTables() {
    let tables = document.querySelectorAll('.table');
    let green_tables = Array.from(tables).filter((table) => table.style['background-color'] == 'green');

    guests = Math.ceil(document.getElementById('guests').value/2);

    if(green_tables.length === guests){
    updateNav();
    nextTab('dish');
    return true;
}
    alert("Bitte wählen Sie weitere Tische aus.");
    return false;
}


    function formSubmit(e){
    e.preventDefault();
    updateNav();
    nextTab('success');
    document.getElementById('success_step').classList.add('finished');


    let start = document.getElementById('start').value;
    let guests = document.getElementById('guests').value;
    let time = document.getElementById('time').value;

    let tables = document.querySelectorAll('.table');
    let tables_selected = [];
    tables.forEach((event) => {
    if(event.style['background-color'] == 'green'){
    tables_selected.push(event.id);
}
})

    createReservation(crypto.randomUUID(), start, time, guests, tables_selected, 'bla', 'blub@example.com');

    return false;
}

    function createReservation(id, start, time, guests, table, dish, contact){
    db_create_doc('panucci', id, {start, time, guests, table, dish, contact});
}

    // couchdb
    // create doc
    function db_create_doc(db, id, data) {
    (async () => {
        const rawResponse = await fetch(`http://127.0.0.1:5984/${db}/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + config.couchdb.auth_header
            },
            body: JSON.stringify(data)
        });
        const content = await rawResponse.json();

        console.log(content);
    })();
}

    // get reservations on date
    function db_get_reservations(db, date, callback){
    (async () => {
        const rawResponse = await fetch(`http://127.0.0.1:5984/${db}/_find`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + config.couchdb.auth_header
            },
            body: JSON.stringify({
                "selector": {
                    "start": date
                },
                "fields": ["_id", "_rev", "table", "time"],
            })
        });
        const content = await rawResponse.json();

        callback(content);
    })();
}

    function cross_reserved_tables(reservations) {
    reservations.docs.forEach(function(reservation){

        reservation.table.forEach(function (table){
            const table_element = document.getElementById(table);
            table_element.classList.add('x');
            table_element.onclick = undefined;
        })

    });

    let select_tables = document.getElementById('guests').value;
    document.getElementById('select_tables').innerHTML = 'Wählen Sie bitte ' + Math.ceil(select_tables/2) + ' Tische aus. (optional)'
}

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    function drop(ev) {
        ev.preventDefault();
        var table = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(table));
    }
