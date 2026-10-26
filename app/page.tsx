import Link from 'next/link'
import { InstallApp } from '@/components/InstallApp'

export default function HomePage() {
  return (
    <main className="hero">
      <section className="stack">
        <span className="badge">🌱 Le Jardin des Devoirs</span>
        <h1>Des additions. Une surprise. Ton jardin.</h1>
        <div className="row">
          <Link className="btn btn-primary" href="/parent">Créer une session</Link>
          <Link className="btn btn-ghost" href="/garden">Jardin</Link>
          <Link className="btn btn-ghost" href="/settings">Settings</Link>
        </div>
        <InstallApp />
      </section>

      <section className="card panel stack">
        <h2>À chaque bonne réponse, une partie apparaît.</h2>
        <p>Fais pousser des décors et accueille parfois une créature. Ton petit monde grandit à ton rythme.</p>
      </section>
    </main>
  )
}
