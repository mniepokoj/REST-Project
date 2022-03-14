var request;
var objJSON;
var id_mongo;
 



var request_db = indexedDB.open("database", 3);

var local_db;


function getRequestObject()      
{
   if ( window.ActiveXObject)  {
        return ( new ActiveXObject("Microsoft.XMLHTTP")) ;
    } else if (window.XMLHttpRequest)  {
       return (new XMLHttpRequest())  ;
    } else {
       return (null) ;
    }
}


request_db.onupgradeneeded = function(event)
{
   var local_db = request_db.result;
   var store;
   if (event.oldVersion < 1) {
     store = local_db.createObjectStore("ankieta", { keyPath: "id", autoIncrement: true });
   }
 
   if (event.oldVersion < 3) {
      local_db.deleteObjectStore("ankieta");
     store = local_db.createObjectStore("ankieta", { keyPath: "id", autoIncrement: true });
   }
	store.createIndex("data_zachorowania", "data_zachorowania");
	store.createIndex("wiek", "wiek");
	store.createIndex("wielkosc_miasta", "wielkosc_miasta");
   store.createIndex("liczba_dawek", "liczba_dawek");
	store.createIndex("objawy", "objawy");
   store.createIndex("time", "time");
}

request_db.onsuccess = function(event)
{
   local_db = request_db.result;
}

request_db.onerror = function(event)
{
   console.log("Nie udało się połączyć z bazą danych");
}


function get_local_data()
{
   var txt = '<h3>Lokalne dane</h3>';
   txt += "<table><tr><th>Id</th><th>Czas</th><th>Data zachorowania</th><th>Wiek</th><th>Wielkość miasta</th><th>Liczba przyjętych dawek</th><th>Objawy</th></tr>";
   var objectStore = local_db.transaction("ankieta").objectStore("ankieta");
   objectStore.openCursor().onsuccess = function(event) 
   {
     var cursor = event.target.result;
     if (cursor) 
     {
        txt += "<tr><td>"+cursor.key+"</td><td>"+cursor.value.time+"</td><td>"+cursor.value.data_zachorowania+"</td><td>"+cursor.value.wiek+"</td><td>";
        txt += cursor.value.wielkosc_miasta+"</td><td>"+cursor.value.liczba_dawek+"</td><td>"+cursor.value.objawy+"</td></tr>";
      cursor.continue();
     }
     else
     {
      txt += "</table>";
      document.getElementById('data').innerHTML = txt;
      document.getElementById('result').innerHTML = "";
     }
   };
};


function add_local_form()
{
   var form = '<h3>Wypełnij ankietę</h3>';
   form+=   '<table id="input_table"><form">';
   form+=   '<tr><td>Data zachorowania</td><td><input type="date" id="data_zachorowania" name="data_zachorowania" min="2020-01-01"></td></tr>';
   form+=   '<tr><td>Wiek</td><td><input type="number" id="wiek" name="wiek" min="0"></td></tr>';
   form+=   '<tr><td>Wielkość miasta</td><td><select id="wielkosc_miasta" name="wielkosc_miasta" size="1">';
   form+=   '<option value="male">małe - poniżej 20tys. mieszkańców</option>';
   form+=   '<option value="srednie">srednie - od 20tys do 100tys mieszkańców</option>';
   form+=   '<option value="duze">duże - powyżej 100tys mieszkańców</option></select></td></tr>';
   form+=   '<tr><td>Liczba przyjętych dawek</td><td><input type="number" id="lb_dawek" name="lb_dawek" min="0"></td></tr>';
   form+=   '<tr><td>Objawy</td><td><select id="objawy" name="objawy" size="1">';
   form+=   '<option value="nie">Nie</option>';
   form+=   '<option value="tak">Tak</option></select></td></tr></table></br>';
   form+=   '<input class="butt" type="button" value="Wyślij" onClick="add_local_data()"></form>';
   document.getElementById('data').innerHTML = form;
   document.getElementById('result').innerHTML = "";
}

function isNumeric(str) 
{
   if (typeof str != "string") return false // we only process strings!  
   return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
 }


function validate_data(data)
{
   var result = {};
   result.val = true;
   result.txt = "";

   if(data.data_zachorowania == "")
   {
      result.val = false;
      result.txt += "Musisz podać date</br>";
   }
   if(!isNumeric(data.wiek) || data.wiek < 0 || data.wiek > 130)
   {
      result.val = false;
      result.txt += "Podany wiek nie jest poprawny</br>";
   }

   if(data.wielkosc_miasta != "male" && data.wielkosc_miasta != "srednie" && data.wielkosc_miasta != "duze")
   {
      result.val = false;
      result.txt += "Podana wielkosc miasta jest bledna</br>";
   }

   if(!isNumeric(data.liczba_dawek) || data.liczba_dawek < 0)
   {
      result.val = false;
      result.txt += "Liczba dawek musi być większa od zera</br>";
   }

   if(data.objawy != "tak" && data.objawy != "nie")
   {
      result.val = false;
      result.txt += "Musisz podać czy występują objawy.</br>";
   }

   return result;

}

function add_local_data()
{
   var t = new Date();
   var data = {};
   data.data_zachorowania = document.getElementById('data_zachorowania').value;
   data.wiek = document.getElementById('wiek').value;
   data.wielkosc_miasta = document.getElementById('wielkosc_miasta').value;
   data.liczba_dawek = document.getElementById('lb_dawek').value;
   data.objawy = document.getElementById('objawy').value;
   data.time = t.getTime();
   var r = validate_data(data);
   if(!r.val)
   {
      document.getElementById('data').innerHTML = "";
      document.getElementById('result').innerHTML = r.txt;
      return;
   }

   var json_data = JSON.stringify(data);
   var db_tr = local_db.transaction("ankieta", "readwrite");
   var obj = db_tr.objectStore("ankieta");

   var op = obj.put(data);
   op.onsuccess = function (event) 
   {
      document.getElementById('data').innerHTML = "";
      document.getElementById('result').innerHTML = "Dane zostały zapisane";
   };
}



function register_form()
{
   var form = '<h3>Rejestracja</h3>';
   form+=   '<div id="formularz"><table id="input_table"><form">';
   form+=   '<tr><td>Nazwa użytkownika: </td><td><input type="text" id="username" name="username" min="2020-01-01"></td></tr>';
   form+=   '<tr><td>Hasło: </td><td><input type="password" id="password" name="password"></td></tr></table></div>';
   form+=   '<input class="butt" type="button" value="Wyślij" onClick="register()"></form>';

   document.getElementById('result').innerHTML = "";
   document.getElementById('data').innerHTML = form;
}

function register()
{
   var xhr = getRequestObject();
   var data = {};
   data.username = document.getElementById('username').value;
   data.password = document.getElementById('password').value;
   var json_data = JSON.stringify(data);

   xhr.open("POST", "http://pascal.fis.agh.edu.pl/~9niepokoj/labs/projekt2/rest/register", true);
   xhr.send(json_data);


   xhr.addEventListener("load", e => {
      if ( xhr.status == 200 )    {
         document.getElementById('data').innerHTML = ''; 
         if(JSON.parse(xhr.response).return == 'ok')
         {
            document.getElementById('result').innerHTML = "Użytkownik został dodany";
         }
         else
         {
            document.getElementById('result').innerHTML = "Podana nazwa użytkownika już istnieje";
         }
      }
   })   
}


function login_form()
{
   var form = '<h3>Logowanie</h3>'
   form+=   '<div id = "formularz"><table id="input_table"><form id="form3">';
   form+=   '<tr><td>Nazwa użytkownika: </td><td><input type="text" id="username" name="username"></td></tr>';
   form+=   '<tr><td>Hasło: </td><td><input type="password" id="password" name="password"></td></tr></table></div>';
   form+=   '<tr><td></td><td><input class="butt" type="button" value="Zaloguj" onClick="login()"></td></tr>';
   document.getElementById('data').innerHTML = form;
   document.getElementById('result').innerHTML = "";
}

function setCookie(cname, cvalue, time) 
{
   document.cookie = cname + "=" + cvalue + ";" + time + ";path=/";
 }

 function getCookie(cname) 
 {
   let name = cname + "=";
   let decodedCookie = decodeURIComponent(document.cookie);
   let ca = decodedCookie.split(';');
   for(let i = 0; i <ca.length; i++) {
     let c = ca[i];
     while (c.charAt(0) == ' ') {
       c = c.substring(1);
     }
     if (c.indexOf(name) == 0) {
       return c.substring(name.length, c.length);
     }
   }
   return "";
 }

 function validate_login(data)
 {
    $txt = "";
    if(data.username.length < 4 )
    {
      $txt += "Nazwa musi składać się conajmniej 4 znaków. ";
    }

    if(data.password.length < 4 )
    {
      $txt += "Hasło musi składać się conajmniej 4 znaków.";
    }
 }

function login()
{
   var xhr = getRequestObject();
   var data = {};
   data.username = document.getElementById('username').value;
   data.password = document.getElementById('password').value;
   var json_data = JSON.stringify(data);

   xhr.open("POST", "http://pascal.fis.agh.edu.pl/~9niepokoj/labs/projekt2/rest/login", true);
   xhr.send(json_data);


   xhr.addEventListener("load", e => 
   {
      if ( xhr.status == 200 )    
      {
         if(JSON.parse(xhr.response).return == 'ok')
         {
            document.getElementById('data').innerHTML = "";
            document.getElementById('result').innerHTML = "Zalogowano";
            send_local_data();
            setCookie("token",JSON.parse(xhr.response).token, JSON.parse(xhr.response).expire_time);
         }
         else
         {
            document.getElementById('result').innerHTML = "Podane dane są niepoprawne";
         }
      }
   })   
}


function logout()
{
   var xhr = getRequestObject();
   var data = {};

   data.token = getCookie('token');
   setCookie('token', '', -1)
   xhr.open("DELETE", "http://pascal.fis.agh.edu.pl/~9niepokoj/labs/projekt2/rest/logout/"+data.token, true);
   xhr.send(null);

   xhr.addEventListener("load", e => 
   {
      if ( xhr.status == 200 )    
      {
         document.getElementById('data').innerHTML = ''; 
         if(JSON.parse(xhr.response).return == 'ok')
         {
            document.getElementById('result').innerHTML = "Wylogowano";
         }
         else
         {
            document.getElementById('result').innerHTML = "Użytkownik nie był zalogowany";
         }
      }
   })   
}

function synchronize()
{
   var k = getCookie('token');
   var k = document.cookie;
   if(getCookie('token') != '')
   {
      send_local_data();
      document.getElementById('data').innerHTML = "";
      document.getElementById('result').innerHTML = "Dane zostały zapisane na serwerze";

   }
}


function send_local_data()
{
   var objectStore = local_db.transaction("ankieta", "readwrite").objectStore("ankieta");

   objectStore.openCursor().onsuccess = function(event) 
   {
      var cursor = event.target.result;
      if (cursor) 
      {
         var data = {};
         data.data_zachorowania = cursor.value.data_zachorowania;
         data.wiek = cursor.value.wiek;
         data.wielkosc_miasta = cursor.value.wielkosc_miasta;
         data.lb_dawek = cursor.value.liczba_dawek;
         data.objawy = cursor.value.objawy;
         data.id = cursor.value.id;
         data.time = cursor.value.time;
         data.token = getCookie('token');
         var json_data = JSON.stringify(data);

         xhr = getRequestObject();
         xhr.open("POST", "http://pascal.fis.agh.edu.pl/~9niepokoj/labs/projekt2/rest/send_data", true);
         xhr.send(json_data);
         cursor.delete();
         cursor.continue();  
      }
   }
}

function get_server_data()
{
   var data = {};
   data.token = getCookie('token');
   var json_data = JSON.stringify(data);

	xhr = getRequestObject();
	xhr.open("POST", "http://pascal.fis.agh.edu.pl/~9niepokoj/labs/projekt2/rest/get_data", true);
   xhr.send(json_data);

   xhr.onreadystatechange = function () 
   {
		if (xhr.readyState == 4 && xhr.status == 200 && JSON.parse(xhr.response).return == "ok")
      {
         objJSON = JSON.parse(xhr.response);

         var array=new Array();

         for ( var id in objJSON )  
         {
            var object = {};
            object.data_zachorowania = objJSON[id]['data_zachorowania'];
            object.wiek = objJSON[id]['wiek'];
            object.wielkosc_miasta = objJSON[id]['wielkosc_miasta'];
            object.liczba_dawek = objJSON[id]['lb_dawek'];
            object.objawy = objJSON[id]['objawy'];
            object.id = objJSON[id]['id'];
            object.time = objJSON[id]['time'];
            if (typeof object.id !== 'undefined') 
            {
               array.push(object);
            }
         }


         var txt = '<h3>Dane pobrane z serwera</h3>';
         txt += "<table><tr><th>Id</th><th>Czas</th><th>Data zachorowania</th><th>Wiek</th><th>Wielkość miasta</th><th>Liczba przyjętych dawek</th><th>Objawy</th></tr>";

         for (const x of array) 
         { 
            txt += "<tr><td>"+x.id+"</td><td>"+x.time+"</td><td>"+x.data_zachorowania+"</td><td>"+x.wiek+"</td><td>";
            txt += x.wielkosc_miasta+"</td><td>"+x.liczba_dawek+"</td><td>"+x.objawy+"</td></tr>";
         }

         txt += "</table>";
         document.getElementById('data').innerHTML = txt;
         document.getElementById('result').innerHTML = "";
		}
	}
}


function draw_data()
{
   var data = {};
   data.token = getCookie('token');
   var json_data = JSON.stringify(data);

	xhr = getRequestObject();
	xhr.open("POST", "http://pascal.fis.agh.edu.pl/~9niepokoj/labs/projekt2/rest/get_data", true);
   xhr.send(json_data);

   xhr.onreadystatechange = function () 
   {
		if (xhr.readyState == 4 && xhr.status == 200 && JSON.parse(xhr.response).return == "ok") 
      {
         objJSON = JSON.parse(xhr.response);



         var array=new Array();

         for ( var id in objJSON )  
         {
            var object = {};
            object.data_zachorowania = objJSON[id]['data_zachorowania'];
            object.wiek = objJSON[id]['wiek'];
            object.wielkosc_miasta = objJSON[id]['wielkosc_miasta'];
            object.liczba_dawek = objJSON[id]['lb_dawek'];
            object.objawy = objJSON[id]['objawy'];
            object.id = objJSON[id]['id'];
            object.time = objJSON[id]['time'];
            array.push(object);
         }

         draw_chart(array);
		}
	}
}

function draw_chart(array)
{
   var male_vac = 0;
   var srednie_vac = 0;
   var duze_vac = 0;
   var male_count = 0;
   var srednie_count = 0;
   var duze_count = 0;

   for (const x of array) 
   { 
      switch(x.wielkosc_miasta)
      {
         case 'male':
            male_count++;
            if(x.liczba_dawek > 1)
            {
               male_vac++;
            }
            break;
            case 'srednie':
               srednie_count++;
               if(x.liczba_dawek > 1)
               {
                  srednie_vac++;
               }
               break;
            case 'duze':
               duze_count++;
               if(x.liczba_dawek > 1)
               {
                  duze_vac++;
               }
               break;
      }
   }

   if(male_count == 0)
   {
      male_count = 1;
   }
   if(srednie_count == 0)
   {
      srednie_count = 1;
   }
   if(duze_count == 0)
   {
      duze_count = 1;
   }

   document.getElementById('data').innerHTML = "";
   document.getElementById('result').innerHTML = '<canvas id="myChart" style="width:100%;max-width:700px"></canvas>';

   var xValues = ["Małe", "Średnie", "Duże"];
   var yValues = [male_vac / male_count * 100, srednie_vac / srednie_count * 100, duze_vac / duze_count * 100];
   var barColors = ["red", "green","blue"];
      
   new Chart("myChart", {
     type: "bar",
     data: {
       labels: xValues,
       datasets: [{
         backgroundColor: barColors,
         data: yValues
       }]
     },
     options: {
       legend: {display: false},
       title: {
         display: true,
         text: "Liczba zaszczepionych conajmniej dwoma dawkami osób w zależności od wielkośi miasta"
       },
       scales: {
         yAxes: [
           {
             ticks: {
               min: 0,
               max: 100// Your absolute max value
             },
             scaleLabel: {
               display: true,
               labelString: '%',
             },
           },
         ],
       },
     }
   });
}

function documentation()
{
   var txt = '<div id="dokumentacja"><h2>Dokumentacja projektu 2 z przedmiotu Techniki Internetowe</h1> <br>';
   txt +=   '<h2>Dokumentacja</h2>';
   txt +=   '<p> Projekt został przygotowoany w ramach przedmiotu Techniki internetowe.</br>';
   txt +=   'Projekt został opracowany przy wykorzystaniu technologi HTML5, CSS3, Java Script, MongoDB, Indexeddb, języka PHP, styl RESTful .</br>';
   txt +=   'Do wykonania wykresów została wykorzystana technologia Chart.js</br>';
   txt +=   'Aplikacja w trybie braku połączenia z serwerem pozwala na dodawanie danych(ankiet) do lokalnej bazy danych oraz ich przeglądanie.</br>';
   txt +=   'Aby połączyć się z serwerem należy stworzyć nowe konto poprzez formularz Rejestracji, a następnie się zalogować.</br>';
   txt +=   'Po zalogowaniu aplikacja automatycznie przesyła wszystkie dane na serwer, a następnie usuwa je z lokalnej bazy danych.</br>';
   txt +=   'W chwili logowania, serwer zwraca token, który zapisywany jest w ciasteczkach i wysyłany na serwer w kolejnych zapytaniach.</br>';
   txt +=   'Aby w trybie zalogowania przesłać kolejne dane na serwer, należy wykorzystać przycisk "Synchronizuj", który przesyła dane na serwer.</br>';
   txt +=   'Aplikacja posiada możliwość analzy danych, w postaci zależności wielkości miasta, a zaszczepienia populacji.</br>';
   txt +=   'Naciśnięcie przycisku wyloguj powoduje zakończenie obecnej sesji.</p></div>';

      
	document.getElementById('result').innerHTML = "";
	document.getElementById('data').innerHTML = txt;
}