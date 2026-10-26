/* Ce lecteur n'accepte que les fragments statiques écrits dans drawings.js.
 * Ce n'est pas un point d'entrée pour du contenu généré à distance. */
(() => {
  const drawings = window.CreatureConcepts;
  let selected = 0;
  const svg = document.querySelector('#specimen');
  const progress = document.querySelector('#progress');
  function groups(drawing, count) {
    return drawing.parts.slice(0, count).map((part, i) => `<g data-part="${i + 1}">${part.svg}</g>`).join('');
  }
  function setStep(step) {
    const drawing = drawings[selected];
    const count = Math.max(0, Math.min(drawing.parts.length, Math.floor(step)));
    svg.innerHTML = groups(drawing, count);
    svg.setAttribute('aria-label', `${drawing.name}, étape ${count} sur ${drawing.parts.length}`);
    progress.value = String(count);
    document.querySelector('#counter').textContent = `${count} / ${drawing.parts.length}`;
    document.querySelector('#step-label').textContent = count ? drawing.parts[count - 1].label : 'Le cadeau attend sa première bonne réponse.';
    document.querySelector('#next').disabled = count === drawing.parts.length;
  }
  function select(index) {
    if (!Number.isInteger(index) || !drawings[index]) throw new Error('Concept inconnu');
    selected = index;
    document.querySelector('#study-title').textContent = drawings[index].name;
    document.querySelector('#study-note').textContent = drawings[index].note;
    progress.max = String(drawings[index].parts.length);
    const studyCount = document.querySelector('#study-count');
    if (studyCount) studyCount.textContent = String(drawings[index].parts.length);
    document.querySelectorAll('.card button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    setStep(0);
  }
  drawings.forEach((drawing, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    // Illustrations locales statiques : aucune entrée utilisateur dans ce HTML.
    card.innerHTML = `<svg viewBox="0 0 320 280" role="img" aria-label="${drawing.name}">${groups(drawing, drawing.parts.length)}</svg><div class="copy"><span class="number">Spécimen ${String(index + 1).padStart(2, '0')}</span><h2>${drawing.name}</h2><p>${drawing.material}</p><button aria-pressed="false">Explorer la découverte</button></div>`;
    card.querySelector('button').addEventListener('click', () => {
      select(index);
      document.querySelector('.study').scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    document.querySelector('#gallery').append(card);
  });
  document.querySelector('#silhouette').addEventListener('click', (event) => {
    const active = document.body.classList.toggle('silhouettes');
    event.currentTarget.setAttribute('aria-pressed', String(active));
    event.currentTarget.textContent = active ? 'Retrouver les couleurs' : 'Voir les silhouettes';
  });
  progress.addEventListener('input', () => setStep(Number(progress.value)));
  document.querySelector('#reset').addEventListener('click', () => setStep(0));
  document.querySelector('#next').addEventListener('click', () => setStep(Number(progress.value) + 1));
  document.querySelector('#complete').addEventListener('click', () => setStep(drawings[selected].parts.length));
  window.CreatureLab = { select, setStep, getDrawing: () => structuredClone(drawings[selected]) };
  select(0);
})();
