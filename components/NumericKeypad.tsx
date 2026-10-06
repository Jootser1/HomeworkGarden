type NumericKeypadProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function NumericKeypad({ value, onChange, onSubmit, disabled = false }: NumericKeypadProps) {
  const press = (key: string) => {
    if (disabled) return
    if (key === 'back') onChange(value.slice(0, -1))
    else if (key === 'ok') onSubmit()
    else if (value.length < 6) onChange(value + key)
  }

  return (
    <div className="keypad" aria-label="Clavier numérique">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
        <button className="key" type="button" key={key} onClick={() => press(key)} disabled={disabled}>{key}</button>
      ))}
      <button className="key key-back" type="button" onClick={() => press('back')} disabled={disabled}>←</button>
      <button className="key" type="button" onClick={() => press('0')} disabled={disabled}>0</button>
      <button className="key key-ok" type="button" onClick={() => press('ok')} disabled={disabled || !value}>✓</button>
    </div>
  )
}
