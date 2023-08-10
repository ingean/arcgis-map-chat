import WebMap from 'https://js.arcgis.com/4.27/@arcgis/core/WebMap.js'
import MapView from 'https://js.arcgis.com/4.27/@arcgis/core/views/MapView.js'
import ActionBar from './ActionBar.js'
import MapTheme from './MapTheme.js'
import * as OAuth2 from './OAuth2.js'
import { mapLayers, answerUserQuestion, answerExample, resetAll } from './chat.js'


const portal = await OAuth2.authenticate() //Authenticate with named user using OAuth2

const webmapId = '5fc0957ab6d94b179f6ccb7810bb498e' // Web Map shared with Geodata Organization
const theme = new MapTheme() // Contains light and dark basemap

const map = new WebMap({
  portalItem: {
    id: webmapId
  }
});

const view = new MapView({
  map,
  container: "viewDiv",
  padding: {
    left: 49
  }
});

theme.view = view

const actionBar = new ActionBar(view, 'chat')

map.when(() => {
  document.querySelector("#header-title").textContent = 'Mapchat'
  document.querySelector("calcite-shell").hidden = false
  document.querySelector("calcite-loader").hidden = true

  const layers = mapLayers(map)

  document.getElementById('btn-find-data')
  .addEventListener('click', e => answerUserQuestion())

  document.getElementById('btn-reset')
  .addEventListener('click', e => resetAll())

  document.getElementById('examples-list')
  .addEventListener('calciteListChange', e => answerExample(e))
})


