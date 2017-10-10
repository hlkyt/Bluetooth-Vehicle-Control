var app = {
  /* αρχικοποιήση της εφαρμογής και κάλεσμα της bindEvents() */
  initialize: function() {
    var timeout=0;
    this.bindEvents();
  },
  /* ορισμός λειτουργίας των πλήκτρων*/
  bindEvents: function() {
    var TOUCH_START = 'touchstart';
      document.addEventListener('deviceready', this.onDeviceReady, false);
    refreshButton.addEventListener(TOUCH_START, this.refreshDeviceList, false);
    deviceList.addEventListener(TOUCH_START, this.connect, false);
    ExitButton.addEventListener(TOUCH_START, this.exit, false);
    up.addEventListener(TOUCH_START, this.sendup,false);
    up.addEventListener('touchend', this.end, false);
    down.addEventListener(TOUCH_START, this.senddown, false);
    down.addEventListener('touchend', this.end, false);
    upright.addEventListener(TOUCH_START, this.sendur, false);
    downright.addEventListener(TOUCH_START, this.senddr, false);
    downleft.addEventListener(TOUCH_START, this.senddl, false);
    upleft.addEventListener(TOUCH_START, this.sendul, false);
    downleft.addEventListener('touchend', this.end, false);
    downright.addEventListener('touchend', this.end, false);
    upleft.addEventListener('touchend', this.end, false);
    upright.addEventListener('touchend', this.end, false);
    document.addEventListener('backbutton', function(){
      var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
      if (activePage[0].id=="buttonPage") {
        bluetoothSerial.disconnect(app.disconnect, app.onError);
      }
      if(activePage[0].id=="detailPage"){
        app.exit();
      }
    },false);
  },
  /*με την έναρξη της εφαρμογής κάλεσμα του plugin και έλεγχος αν είναι ανοιχτό το bluetooth*/
  /*αν δεν είναι εμφανίζεται μήνυμα για ενεργοποιήση του bluetooth */
  /*Τέλος καλείται η refreshDeviceList()*/
  onDeviceReady: function() {
    //This function will be used for switching on the device bluetooth
    cordova.plugins.BluetoothStatus.promptForBT();
    bluetoothSerial.isEnabled(app.refreshDeviceList,
      function(){
        if (window.confirm('If you did not turn on Bluetooth, press "Ok", enable it and press the refreshButton.'))
        {
          app.refreshDeviceList();
        }
        else
        {
          app.exit();
        }
      }
    );
  },
  /*η refreshDeviceList() καλεί την συνάρτηση του bluetooth plugin, list(true,false)*/
  //σε περίπτωση επιτυχίας καλείται η onDeviceList(), διαφορετικά η onError() */
  refreshDeviceList: function() {
    bluetoothSerial.list(app.onDeviceList, app.onError);
  },
  //η list στέλνει στην onDeviceList μία λίστα με όλες τις συζευγμένες συσκευές
  onDeviceList: function(devices) {
    var option;
    // διαγραφή των προηγούμενων συσκευών που ήταν εμφανισμένες
    deviceList.innerHTML = "";
    app.setStatus("");
    //κάθε συσκευή προστίεθεται στη λίστα με το παρακάτω τρόπο
    devices.forEach(function(device) {
      var listItem = document.createElement('li');
      html = '<b>' + device.name + '</b><br/>' + device.id;
      listItem.innerHTML = html;
      listItem.setAttribute('deviceId', device.id);

      //αντιστοίχως για windowsphone λειτουργικό      
      deviceList.appendChild(listItem);
    });

    /*αν δεν υπάρχουν συζευγμένες συσκεύες εμφάνιση του μηνύματος "No Bluetooth Devices"*/
    //διαφορετικά εμφάνιση των συσκευών
    if (devices.length === 0) {
      option = document.createElement('option');
      option.innerHTML = "No Bluetooth Devices";
      deviceList.appendChild(option);
      app.setStatus("Please Pair a Bluetooth Device.");
    } else {
      app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
    }
  },
// αίτημα σύνδεσης στη συσκευή της επιλογής μας
  connect: function (e) {
      var device = e.target.getAttribute('deviceId');
      alert("Requesting connection to " + device);
      bluetoothSerial.connect(device,app.onconnect,app.disconnect);
  },
  // όταν συνδεθεί μεταφέρεται στη σελίδα με τα βέλη
  onconnect: function () {
      app.setStatus("Connected.");
      $.mobile.pageContainer.pagecontainer("change", "#buttonPage");
  },
  //σε πείπρτωση που πατηθεί το πλήκτρο εξόδου
  exit: function(e){
    navigator.app.exitApp();
  },
//έπειτα ακολουθεί η λειτουργία που θα εκτελέσουν τα βέλη αντιστοίχως
  sendup: function(e) {
    timeout = setInterval(function(){
      bluetoothSerial.write(8+"\n");
    }, 1);
  },
  senddown: function () {
    timeout = setInterval(function(){
        bluetoothSerial.write(2+"\n");
    }, 1);
  },
  sendul:function(){
    timeout = setInterval(function(){
      bluetoothSerial.write(7+"\n");
    }, 1);
  },
  sendur:function(){
    timeout = setInterval(function(){
      bluetoothSerial.write(9+"\n");
    }, 1);
  },
  senddl:function(){
    timeout = setInterval(function(){
      bluetoothSerial.write(1+"\n");
    }, 1);
  },
  senddr:function(){
    timeout = setInterval(function(){
      bluetoothSerial.write(3+"\n");
    }, 1);
  },
  end: function(){
    clearInterval(timeout);
    bluetoothSerial.write(5+"\n");
  },
// σε περίπτωση αποσύνδεσης
  disconnect:function(){
    $.mobile.pageContainer.pagecontainer("change", "#detailPage");
  },
  setStatus: function(message) {
    console.log(message);
    window.clearTimeout(app.statusTimeout);
    statusDiv.innerHTML = message;
    statusDiv.className = 'fadein';
    app.statusTimeout = setTimeout(function () {
      statusDiv.className = 'fadeout';
    }, 2000);
  },
  onError: function(reason) {
    alert("ERROR: " + reason);
  }
};
