const { app, Tray, Menu } = require('electron');
const path = require('path');
const { utcToZonedTime, format } = require('date-fns-tz');
const Store = require('electron-store');
const store = new Store();
const timezones = require('./utils/timezones.json');
let tray;
let tzArray = [];

app.dock.hide();

timezones.forEach( async (timezone) => {
  tzArray.push({ 
    label: timezone.timezone, 
    icon: path.join(__dirname, 'assets', 'flags', timezone.flag), 
    click: () => { 
      setTimezone(timezone); 
    }})
});

function setTimezone(timezone) {
  tray.setImage(path.join(__dirname, 'assets', 'flags', timezone.flag));
  tray.setTitle(getDateTime(timezone.timezone));
  tray.setContextMenu(timeMenu);
  store.set('timezone', timezone);
}

function getDateTime(time) {
  const date = new Date();
  const zonedDate = utcToZonedTime(date, time);

  const pattern = ' HH:mm';
  return output = format(zonedDate, pattern, { timeZone: time });
}

function changeMenu() {
  tray.popUpContextMenu(chooseMenu);
}

const chooseMenu =  Menu.buildFromTemplate([
  ...tzArray,
  { label: 'Exit', click: () => { app.quit(); }}
]);

const timeMenu = Menu.buildFromTemplate([
  { label: 'Choose new timezone', click: () => { changeMenu(); } },
  { label: 'Exit', click: () => { app.quit(); }}
]);

app.whenReady().then(() => {
  const tz = store.get('timezone') ? store.get('timezone') : null;

  tray = new Tray(tz ? path.join(__dirname, 'assets', 'flags' , tz.flag) : path.join(__dirname, 'assets', 'icon.png'));
  tray.setContextMenu(tz ? timeMenu : chooseMenu);
  tray.setTitle(tz ? getDateTime(tz.timezone) : 'Choose a timezone');

  setInterval(() => {
    if (tz) {
      tray.setTitle(getDateTime(tz.timezone));
    }
  }, 10000);
});