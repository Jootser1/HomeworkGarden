/* Standalone experimental reader. Drawing JSON is data, never executable SVG/HTML. */
(() => {
  'use strict'
  const NS = 'http://www.w3.org/2000/svg'
  const allowed = {
    path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
    circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
    ellipse: ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke', 'stroke-width'],
    rect: ['x', 'y', 'width', 'height', 'rx', 'fill', 'stroke', 'stroke-width'],
    line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'stroke-linecap'],
    polyline: ['points', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
  }
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  const fail = message => { throw new Error(message) }
  const exactKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key))
  function validateDrawing(value) {
    if (!object(value) || !exactKeys(value, ['version','id','name','description','viewBox','palette','parts'])) fail('Document invalide.')
    if (value.version !== 1 || typeof value.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(value.id)) fail('Version ou identifiant invalide.')
    if (typeof value.name !== 'string' || value.name.length < 1 || value.name.length > 100 || typeof value.description !== 'string' || value.description.length > 500) fail('Description invalide.')
    if (JSON.stringify(value.viewBox) !== '[0,0,320,300]') fail('Le dessin doit utiliser le repère 320 × 300.')
    if (!Array.isArray(value.palette) || !value.palette.length || value.palette.length > 24 || !value.palette.every(color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))) fail('Palette invalide.')
    if (!Array.isArray(value.parts) || !value.parts.length || value.parts.length > 40) fail('Le dessin doit comporter de 1 à 40 groupes.')
    const colors = new Set(value.palette.map(color => color.toUpperCase()))
    const ids = new Set()
    let total = 0
    for (const part of value.parts) {
      if (!object(part) || !exactKeys(part, ['id','label','shapes']) || typeof part.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(part.id) || ids.has(part.id)) fail('Identifiant de groupe invalide ou répété.')
      ids.add(part.id)
      if (typeof part.label !== 'string' || part.label.length < 1 || part.label.length > 150 || !Array.isArray(part.shapes) || !part.shapes.length || part.shapes.length > 30) fail('Groupe vide ou invalide.')
      for (const shape of part.shapes) {
        if (!object(shape) || !exactKeys(shape, ['tag','attrs']) || typeof shape.tag !== 'string' || !Object.hasOwn(allowed, shape.tag) || !object(shape.attrs) || !exactKeys(shape.attrs, allowed[shape.tag])) fail('Forme ou attribut interdit.')
        total++
        if (total > 500) fail('Dessin trop complexe.')
        for (const [key, attr] of Object.entries(shape.attrs)) {
          if (key === 'fill' || key === 'stroke') {
            if (typeof attr !== 'string' || (attr !== 'none' && !colors.has(attr.toUpperCase()))) fail('Couleur hors palette ou référence externe interdite.')
          } else if (key === 'd') {
            if (typeof attr !== 'string' || attr.length > 4000 || !/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]+$/.test(attr)) fail('Chemin invalide.')
          } else if (key === 'points') {
            if (typeof attr !== 'string' || attr.length > 2000 || !/^[0-9eE.,+\-\s]+$/.test(attr)) fail('Points invalides.')
          } else if (key === 'stroke-linecap') {
            if (!['round','butt','square'].includes(attr)) fail('Extrémité de trait invalide.')
          } else if (key === 'stroke-linejoin') {
            if (!['round','miter','bevel'].includes(attr)) fail('Jonction invalide.')
          } else if (typeof attr !== 'number' || !Number.isFinite(attr) || Math.abs(attr) > 640 || (['r','rx','ry','width','height','stroke-width'].includes(key) && attr < 0) || (key === 'stroke-width' && attr > 12)) fail('Dimension invalide.')
        }
        const required = { path:['d'], circle:['cx','cy','r'], ellipse:['cx','cy','rx','ry'], rect:['x','y','width','height'], line:['x1','y1','x2','y2'], polyline:['points'] }[shape.tag]
        if (!required.every(key => Object.hasOwn(shape.attrs, key))) fail('Géométrie incomplète.')
        if (!Object.hasOwn(shape.attrs,'fill') && !Object.hasOwn(shape.attrs,'stroke')) fail('Apparence manquante.')
      }
    }
    return value
  }
  function renderDrawing(drawing, count) {
    const root = document.createElementNS(NS, 'svg')
    root.setAttribute('viewBox', drawing.viewBox.join(' '))
    root.setAttribute('role','img')
    root.setAttribute('aria-label', count === drawing.parts.length ? drawing.name : 'Un objet se construit')
    // No innerHTML, SVG source parsing, href, style, filter, event handlers or external resources.
    for (const part of drawing.parts.slice(0, count)) {
      const group = document.createElementNS(NS, 'g')
      group.dataset.partId = part.id
      for (const shape of part.shapes) {
        const node = document.createElementNS(NS, shape.tag)
        for (const [key, attr] of Object.entries(shape.attrs)) node.setAttribute(key,String(attr))
        group.append(node)
      }
      root.append(group)
    }
    return root
  }
  const examples = JSON.parse(document.getElementById('examples').textContent).map(validateDrawing)
  const selector = document.getElementById('example')
  const range = document.getElementById('step')
  const size = document.getElementById('size')
  const stage = document.getElementById('art')
  let active = 0, count = 0
  const show = () => {
    const drawing = examples[active]
    range.max = String(drawing.parts.length)
    range.value = String(count)
    selector.value = String(active)
    document.getElementById('title').textContent = drawing.name
    document.getElementById('description').textContent = drawing.description
    document.getElementById('counter').textContent = `${count} / ${drawing.parts.length}`
    document.getElementById('addition').textContent = count ? drawing.parts[count-1].label : 'Le cadeau est encore caché.'
    document.getElementById('previous').disabled = count === 0
    document.getElementById('next').disabled = count === drawing.parts.length
    stage.style.width = `${size.value}px`
    stage.replaceChildren(renderDrawing(drawing,count))
  }
  examples.forEach((drawing,index) => { const option=document.createElement('option');option.value=String(index);option.textContent=`${drawing.parts.length} étapes · ${drawing.name}`;selector.append(option) })
  selector.addEventListener('change',()=>{active=Number(selector.value);count=0;show()})
  size.addEventListener('change',show)
  range.addEventListener('input',()=>{count=Number(range.value);show()})
  document.getElementById('previous').addEventListener('click',()=>{count=Math.max(0,count-1);show()})
  document.getElementById('next').addEventListener('click',()=>{count=Math.min(examples[active].parts.length,count+1);show()})
  document.getElementById('complete').addEventListener('click',()=>{count=examples[active].parts.length;show()})
  document.getElementById('restart').addEventListener('click',()=>{count=0;show()})
  document.getElementById('import').addEventListener('click',()=>{
    const error=document.getElementById('import-error')
    try {
      const text=document.getElementById('json-input').value
      if(text.length>150000)fail('Document trop grand.')
      const drawing=validateDrawing(JSON.parse(text))
      examples.push(drawing)
      const option=document.createElement('option');option.value=String(examples.length-1);option.textContent=`Import · ${drawing.parts.length} étapes · ${drawing.name}`;selector.append(option)
      active=examples.length-1;count=0;show();error.textContent='Dessin importé. Contrôle visuel nécessaire : les raccords et l’intérêt des étapes ne sont pas garantis par le format.'
    } catch(err) { error.textContent=`Import refusé : ${err.message}` }
  })
  window.VectorLab = {
    validateDrawing,
    show(index) { if(!examples[index])fail('Exemple inconnu');active=index;count=0;show() },
    setStep(step) { count=Math.max(0,Math.min(examples[active].parts.length,step));show() },
    setSize(width) { size.value=String(width);show() },
    getDrawing() { return structuredClone(examples[active]) },
  }
  show()
})()
