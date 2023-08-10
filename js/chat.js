import { askChatGPT } from "./api.js"
import { el } from "./html.js"

var MAP = null
var activeLayer = null
var layers = null

export const mapLayers = (map) => {
  MAP = map
  let layersCollection = map.allLayers
  layers = layersCollection.map(layer => layer.title).toArray()
  return layers
}

export const answerExample = async (e) => {
  let selection = await e.currentTarget.selectedItems
  const question = selection[0].value

  document.getElementById('txt-query').value = question
  searchByChat(question)
}

export const answerUserQuestion = async () => {
  const question = document.getElementById('txt-query').value
  searchByChat(question)
}

const searchByChat = async (question) => {
  document.getElementById('search-loader').hidden = false
  reset()
  let title = await findLayerTitle(question)
  let layer = enableLayer(title)
  let fields = layerAttributes(layer)
  let whereClause = await buildQuery(question, fields)
  filterLayer(layer, whereClause)
  document.getElementById('search-loader').hidden = true
}

export const findLayerTitle = async (question) => {
  const prompt = `
  Based on the following list of arcgis map layers: ${layers.toString()} 
  pick the most relevant based on the following question: ${question}. 
  Answer with just the name of the layer selected from the provided list e.g. ${layers[1]} 
  Never include any explaination in the response.`
  
  let chatResponse = await askChatGPT(prompt)
  console.log(`Foreslår å aktivere følgende lag: ${chatResponse}`)
  return chatResponse 
}

const buildQuery = async (question, fields) => {
  const prompt = `
  Based on the following list of columns in the dataset: ${fields.toString()}
  build a sql where clause based on the following question: ${question}.
  Answer with just the SQL where clause e.g. "WHERE fylkesnavn = 'Vestfold og Telemark'"`
  
  let chatResponse = await askChatGPT(prompt)
  chatResponse = chatResponse.replace('WHERE ', '')
  console.log(`Foreslår følgende filter: ${chatResponse}`)
  return chatResponse
}

const layerAttributes = (layer) => {
  //return layer.fields.map(field => `${field.name} (alias: ${field.alias})`)
  return layer.fields.map(field => field.name)
}

const getLayer = (title) => {
  return MAP.allLayers.find(layer => layer.title === title)
}

const enableLayer = (title) => {
  let layer = getLayer(title)
  if (layer) activeLayer = layer
  addLayerVisibilityNotice(title)
  layer.visible = true
  return layer
}

const filterLayer = (layer, whereClause) => {
  addQuerySuggestion(layer, whereClause)
  layer.definitionExpression = whereClause
}

const addLayerVisibilityNotice = (title) => {
  let block = el('calcite-block', {id: 'result-block', open: true, heading: "Resultater", description: "Forslag til kartlag og filtre"}, [
    el('calcite-icon', {slot: 'icon', icon: 'layer-filter'}),
    el('calcite-notice', {open: true, icon: 'layer'}, [
      el('div', {slot: 'title'}, 'Viser kartlaget'), 
      el('div', {slot: 'message'}, title)
    ])
  ])
  addToResultDisplay(block)
}

const addQuerySuggestion = (layer, whereClause) => {
  let queryDisplay = document.getElementById('query-result')
  if (queryDisplay) {
    queryDisplay.value = whereClause
  } else {
    queryDisplay = el('calcite-text-area', {id: 'query-result', class: 'panel-input', slot: 'message', value: whereClause})
    queryDisplay.addEventListener('calciteTextAreaChange', event => filterLayer(layer, queryDisplay.value))
    let title = el('div', {slot: 'title'}, 'Filtrert med uttrykket')
    let notice = el('calcite-notice', {open: true, icon: 'filter'}, [title, queryDisplay])
    let block = document.getElementById('result-block')
    block.appendChild(notice)
  }
}

const addToResultDisplay = (node) => {
  let container = document.getElementById('chat-results')
  container.appendChild(node)
}

const clearResultDisplay = () => {
  let container = document.getElementById('chat-results')
  container.replaceChildren()
}

const clearActiveLayer = () => {
  if (!activeLayer) return
  activeLayer.visible = false
  activeLayer.definitionExpression = null
  activeLayer = null
}

const reset = () => {
  clearResultDisplay()
  clearActiveLayer()
}

export const resetAll = () => {
  reset()
  document.getElementById('txt-query').value = ''
}