import { Link } from 'react-router-dom'
import { Empty } from '../components/ui'

export function NotFound() {
  return (
    <Empty quip="Aquí no hay nada. Te has perdido como el que busca la sal en casa ajena.">
      <Link to="/" className="btn btn--primary">
        Volver al inicio
      </Link>
    </Empty>
  )
}
