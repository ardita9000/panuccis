    currentView = 'reservation_view'
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

document.onreadystatechange = () =>{
    const dishInputs = document.querySelectorAll('#dish select');
    dishInputs.forEach((input) => {
        input.addEventListener('change', dishSelected);
    });

    const contactDataInputs = document.querySelectorAll('#contact input');
    contactDataInputs.forEach((input) => {
        input.addEventListener('change', checkContactForm);
    });

    const mainDataInputs = document.querySelectorAll('#mainData select');
    mainDataInputs.forEach((input) => {
        input.addEventListener('change', mainDataSelected);
    });
};

function nextTab(theNextTab) {
    document.getElementById(currentTab).style.display = 'none';
    document.getElementById(`${currentTab}_step`).classList.remove('active');
    if (theNextTab === 'table') {
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
    document.getElementById('logoutButton').style.display = 'block';
}

function workerLogout() {
    document.getElementById('workerLogin').style.display = 'block';
    document.getElementById('workerOverview').style.display = 'none';
    document.getElementById("username").value = '';
    document.getElementById("password").value = '';
    document.getElementById('logoutButton').style.display = 'none';
}

function workerNextDate() {
    document.getElementById('workerPrevButton').disabled = false;
    document.getElementById('workerNextButton').disabled = true;
    document.getElementById('workerDate').innerHTML = '28.01.22'
    document.getElementById('second').style.display = "table";
    document.getElementById('first').style.display = 'none';
}

function workerPrevDate() {
    document.getElementById('workerPrevButton').disabled = true;
    document.getElementById('workerNextButton').disabled = false;
    document.getElementById('workerDate').innerHTML = '27.01.22 (heute)'
    document.getElementById('first').style.display = "table";
    document.getElementById('second').style.display = 'none';
}

function updateNav() {
    guests = document.getElementById('guests').value;
    date = document.getElementById('start').value;
    time = document.getElementById('time').value;
    document.getElementById('description').innerText = guests + ' Pers., ' + date + ', ' + time + 'Uhr';
    document.getElementById(`${currentTab}_step`).classList.add('finished');

    if (currentTab == 'table') {
        let tables = document.querySelectorAll('.table-position > img');
        let tables_selected = false;
        tables.forEach((event) => {
            if (event.style['background-color'] == 'lime') {
                tables_selected = true;
            }
        })
        if (tables_selected) {
            document.getElementById('table_description').innerText = 'Tisch ausgewählt'
        }
    }

    if (currentTab == 'dish') {
        let selects = document.querySelectorAll('#dish select');
        if (Array.from(selects).some((event) => event.value != '')) {
            document.getElementById('dish_description').innerText = 'Speisen ausgewählt'
        }
    }

}

function updateMaxDish(){
		var selectDish = document.getElementsByClassName("selectDish");
		var contents;

		for (let i = 0; i <= document.getElementById('guests').value; i++) {
			contents += "<option>" + i + "</option>";
		}

		for (let i = 0; i < selectDish.length; i++) {
			selectDish[i].innerHTML = contents;
		}
	}
    
function selectedTable() {

    let tables = document.querySelectorAll('.table-position > img');
    let green_tables = Array.from(tables).filter((table) => table.style['background-color'] == 'lime');

    let guests = Math.ceil(document.getElementById('guests').value / 2);

    let submitButton = document.getElementById('tableSubmit');

    if (green_tables.length >= guests) {
        if (event.target.style['background-color'] == 'lime') {
            event.target.style['background-color'] = '';
            event.target.style['box-shadow'] = '';
            if (!tablesCorrectlySelected()) {
                submitButton.style.backgroundColor = '';
            }
            return;
        }
        alert("Sie haben für die gewählte Personenanzahl ausreichend Tische ausgewählt");
        return;
    }

    if (event.target.style['background-color'] == 'lime') {
        event.target.style['background-color'] = '';
        event.target.style['box-shadow'] = '';

        if (!tablesCorrectlySelected()) {
            submitButton.style.backgroundColor = '';
        }

    } else {
        event.target.style['background-color'] = 'lime';
        event.target.style['box-shadow'] = '0 0 15px lime';
        if (tablesCorrectlySelected()) {
            submitButton.style.backgroundColor = '#00b33c';
        } else {
            submitButton.style.backgroundColor = '';
        }
    }
}

function tablesCorrectlySelected(changedTable = undefined) {
    let tables = document.querySelectorAll('.table-position > img');
    let green_tables = Array.from(tables).filter((table) => table.style['background-color'] == 'lime');

    let seats = 0;
    green_tables.forEach((table) => {
        if (table.id.includes('2er')) {
            seats += 2;
        } else if (table.id.includes('4er')) {
            seats += 4;
        }
    });

    let guests = document.getElementById('guests').value;

    if (guests <= seats) {
        return true;
    }
    return false;
}

function selectTables() {
    if (tablesCorrectlySelected()) {
        updateNav();
        nextTab('dish');
        return true;
    }

    alert("Bitte wählen Sie weitere Tische aus.");
    return false;
}

function dishSelected() {
    document.getElementById('dish-selection').style.backgroundColor = '#00b33c';
}

function mainDataSelected() {
    document.getElementById('main-data-select').style.backgroundColor = '#00b33c';
}

function checkContactForm() {
    const inputs = document.querySelectorAll('#contact input');
    let inputsOk = true;
    inputs.forEach((input) => {
       if(!input.checkValidity()){
           document.getElementById('form-submit').style.backgroundColor = 'lightgrey';
           inputsOk = false;
       }
    });
    if(inputsOk) {
        document.getElementById('form-submit').style.backgroundColor = '#00b33c';
        return true;
    }
    return false;
}
function formSubmit(e) {
    e.preventDefault();
    updateNav();
    nextTab('success');
    document.getElementById('success_step').style.visibility = 'visible';
    document.getElementById('success_description').innerText = 'Reservierung abgeschlossen';
    document.getElementById('success_step').classList.add('finished');


    let start = document.getElementById('start').value;
    let guests = document.getElementById('guests').value;
    let time = document.getElementById('time').value;

    let tables = document.querySelectorAll('.table-position > img');
    let tables_selected = [];
    tables.forEach((event) => {
        if (event.style['background-color'] == 'lime') {
            tables_selected.push(event.id);
        }
    })

    createReservation(crypto.randomUUID(), start, time, guests, tables_selected, 'bla', 'blub@example.com');

    return false;
}

function createReservation(id, start, time, guests, table, dish, contact) {
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
function db_get_reservations(db, date, callback) {
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

// cross reserved tables
// disable onclick and draggable
function cross_reserved_tables(reservations) {
    reservations.docs.forEach(function (reservation) {

        reservation.table.forEach(function (table) {
            let table_element = document.getElementById(table);
            let img_src;
            if (table_element.id.startsWith('t') && table_element.tagName == 'img') {
                const img_el = table_element.children;
                img_src = img_el[0].getAttribute('src');
            } else if (table_element.id.startsWith('w') || table_element.id.startsWith('g')) {
                img_src = table_element.getAttribute('src');
                table_element = table_element.parentElement;
            } else {
                console.log('falsches img/table')
                return;
            }

            table_element.removeChild(table_element.firstElementChild);

            if (img_src == 'images/tisch2er-v.png') {
                const imageElement = document.createElement('img');
                imageElement.src = '/images/tisch2er-v-x.png';
                table_element.appendChild(imageElement);
            }

            if (img_src == 'images/tisch2er.png') {
                const imageElement = document.createElement('img');
                imageElement.src = '/images/tisch2er-x.png';
                table_element.appendChild(imageElement);
            }

            if (img_src == 'images/tisch4er-v.png') {
                const imageElement = document.createElement('img');
                imageElement.src = '/images/tisch4er-v-x.png';
                table_element.appendChild(imageElement);
            }

            if (img_src == 'images/tisch4er.png') {
                const imageElement = document.createElement('img');
                imageElement.src = '/images/tisch4er-x.png';
                table_element.appendChild(imageElement);
            }

            table_element.onclick = undefined;
            table_element.draggable = false;
        })

    });

}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id)

    const img = ev.target.src;
    if (img.includes('tisch2er-v')) {
        target_prefix = 'target-w-2-v';
    } else if (img.includes('tisch2er')) {
        target_prefix = 'target-w-2';
    } else if (img.includes('tisch4')) {
        target_prefix = 'target4';
    } else {
        return;
    }

    document.querySelectorAll('.target-area').forEach((elem) => {
        if (elem.previousElementSibling === ev.target) {
            return;
        }
        const firstChild = elem.previousElementSibling.firstElementChild;
        if (firstChild && elem.previousElementSibling.firstElementChild.src.includes('tisch2er-x')) {
            return;
        }
        elem.classList.forEach((cl) => {
            if (cl.startsWith(target_prefix)) {
                elem.style.backgroundColor = 'lightgreen';
            }
        })
    });


}

function drop(ev) {
    ev.preventDefault();
    let table = ev.dataTransfer.getData("text");
    if (table === '') {
        return;
    }
    const src_elem = document.getElementById(table);
    ev.target.appendChild(src_elem);

    // reset highlight
    const img = src_elem.src;
    if (img.includes('tisch2er-v')) {
        target_prefix = 'target-w-2-v';
    } else if (img.includes('tisch2er')) {
        target_prefix = 'target-w-2';
    } else if (img.includes('tisch4er')) {
        target_prefix = 'target4';
    }else {
        return;
    }

    document.querySelectorAll('.target-area').forEach((elem) => {
        elem.classList.forEach((cl) => {
            if (cl.startsWith(target_prefix)) {
                elem.style.backgroundColor = '';
            }
        })
    });
}
