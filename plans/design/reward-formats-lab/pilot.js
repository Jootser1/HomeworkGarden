(() => {
  const NS = 'http://www.w3.org/2000/svg'
  const drawings = window.RewardPilotDrawings
  const labels = { decor: 'Décor', creature: 'Créature', exceptional: 'Créature exceptionnelle' }
  const tags = new Set(['path', 'ellipse', 'circle', 'rect', 'line', 'polyline'])
  const attributes = new Set(['d', 'cx', 'cy', 'rx', 'ry', 'r', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'])
  const motions = new Set(['tail', 'gill-left', 'gill-right', 'flipper', 'moon'])
  const get = id => document.getElementById(id)
  let selected = 0, step = 0

  function render(drawing, count, root) {
    root.replaceChildren()
    for (const part of drawing.parts.slice(0, count)) {
      const group = document.createElementNS(NS, 'g')
      group.dataset.partId = part.id
      if (motions.has(part.motion)) group.dataset.motion = part.motion
      for (const shape of part.shapes) {
        if (!tags.has(shape.tag)) throw new Error('Forme interdite dans le pilote')
        const node = document.createElementNS(NS, shape.tag)
        for (const [key, value] of Object.entries(shape.attrs)) {
          if (!attributes.has(key)) throw new Error('Attribut interdit dans le pilote')
          node.setAttribute(key, String(value))
        }
        group.append(node)
      }
      root.append(group)
    }
  }
  function show() {
    const drawing = drawings[selected]
    get('study-title').textContent = drawing.name
    get('study-kind').textContent = `${labels[drawing.kind]} · ${drawing.format} réponses`
    get('study-description').textContent = drawing.description
    get('sheet-number').textContent = String(selected + 1).padStart(2, '0')
    get('counter').textContent = `${step} / ${drawing.format}`
    get('progress').max = String(drawing.format)
    get('progress').value = String(step)
    get('addition').textContent = step ? drawing.parts[step - 1].label : 'Le cadeau est encore caché.'
    get('next').disabled = step === drawing.format
    get('complete').disabled = step === drawing.format
    get('restart').disabled = step === 0
    get('specimen').setAttribute('aria-label', step === drawing.format ? drawing.name : `Un cadeau se construit : ${step} sur ${drawing.format}`)
    render(drawing, step, get('specimen'))
    document.querySelectorAll('[data-specimen]').forEach((card, index) => card.setAttribute('aria-pressed', String(index === selected)))
  }
  function select(index) {
    if (!Number.isInteger(index) || !drawings[index]) throw new Error('Composition inconnue')
    selected = index; step = 0; show()
  }
  function setStep(count) {
    if (!Number.isSafeInteger(count)) throw new Error('Étape invalide')
    step = Math.max(0, Math.min(drawings[selected].format, count)); show()
  }
  for (const [index, drawing] of drawings.entries()) {
    if (drawing.parts.length !== drawing.format || new Set(drawing.parts.map(part => part.id)).size !== drawing.format) throw new Error('Plan de découverte incohérent')
    const card = document.createElement('button')
    card.type = 'button'; card.className = 'specimen-card'; card.dataset.specimen = drawing.id
    const miniature = document.createElement('span'); miniature.className = 'miniature'
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 320 300'); svg.setAttribute('aria-hidden', 'true')
    render(drawing, drawing.format, svg); miniature.append(svg)
    const caption = document.createElement('span'); caption.className = 'card-text'
    const label = document.createElement('span'); label.className = 'card-label'; label.textContent = `${labels[drawing.kind]} · ${drawing.format} réponses`
    const name = document.createElement('span'); name.className = 'card-name'; name.textContent = drawing.name
    caption.append(label, name); card.append(miniature, caption)
    card.addEventListener('click', () => { select(index); get('study-title').focus({ preventScroll: true }); get('study-title').scrollIntoView({ behavior: 'instant', block: 'center' }) })
    get('collection').append(card)
  }
  get('progress').addEventListener('input', event => setStep(Number(event.target.value)))
  get('next').addEventListener('click', () => setStep(step + 1))
  get('complete').addEventListener('click', () => setStep(drawings[selected].format))
  get('restart').addEventListener('click', () => setStep(0))
  get('size').addEventListener('change', event => { get('specimen').style.width = `${event.target.value}px` })
  get('silhouette').addEventListener('click', () => {
    const active = document.body.classList.toggle('silhouette')
    get('silhouette').setAttribute('aria-pressed', String(active))
    get('silhouette').textContent = active ? 'Retrouver les couleurs' : 'Voir les silhouettes'
  })
  get('motion').addEventListener('click', () => {
    const paused = document.body.classList.toggle('rest')
    get('motion').setAttribute('aria-pressed', String(!paused))
    get('motion').textContent = paused ? 'Animer' : 'Mettre au repos'
  })
  window.RewardFormatsPilot = { drawings, select, setStep }
  show()
})()
